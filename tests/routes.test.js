import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../src/app.js";
import { userRegisterValidator } from "../src/validators/auth.validator.js";
import { validationResult } from "express-validator";

let server;
let baseURL;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseURL = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
});

test("app imports and health route responds without a database", async () => {
    const response = await fetch(`${baseURL}/api/v1/healthcheck`);
    assert.equal(response.status, 200);
});

for (const path of ["register", "login", "forgot-password", "reset-password/invalid"]) {
    test(`${path} rejects invalid input before database access`, async () => {
        const response = await fetch(`${baseURL}/api/v1/auth/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
        });
        assert.equal(response.status, 422);
    });
}

test("verification route matches the email URL and validates its token", async () => {
    const response = await fetch(`${baseURL}/api/v1/auth/verify-email/invalid`);
    assert.equal(response.status, 422);
});

test("refresh reaches refresh-token validation without an access token", async () => {
    const response = await fetch(`${baseURL}/api/v1/auth/refresh-access-token`, {
        method: "POST",
    });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).message, "Unauthorized: No refresh token provided");
});

test("change-password route requires authentication", async () => {
    const response = await fetch(`${baseURL}/api/v1/auth/change-password`, {
        method: "POST",
    });
    assert.equal(response.status, 401);
});

test("registration preserves password spaces and rejects non-string passwords", async () => {
    const req = { body: { name: "Bhuban", email: " USER@example.com ", password: " secret " } };
    for (const validator of userRegisterValidator()) await validator.run(req);
    assert.equal(validationResult(req).isEmpty(), true);
    assert.equal(req.body.password, " secret ");
    assert.equal(req.body.email, "user@example.com");

    const invalid = { body: { name: "Bhuban", email: "user@example.com", password: 123456 } };
    for (const validator of userRegisterValidator()) await validator.run(invalid);
    assert.equal(validationResult(invalid).isEmpty(), false);
});

test("product creation without a body returns a client error", async () => {
    const response = await fetch(`${baseURL}/api/v1/products`, { method: "POST" });
    assert.equal(response.status, 400);
});

test("fractional stock is rejected on product updates", async () => {
    const response = await fetch(`${baseURL}/api/v1/products/507f1f77bcf86cd799439011`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: 1.5 }),
    });
    assert.equal(response.status, 400);
});

test("repeated search parameters return a client error", async () => {
    const response = await fetch(`${baseURL}/api/v1/products?search=a&search=b`);
    assert.equal(response.status, 400);
});
