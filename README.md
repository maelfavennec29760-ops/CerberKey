# CerberKey

**An experimental image-based authentication project combining cryptography, steganography and full-stack web development.**

CerberKey is a personal project built to explore an unconventional authentication concept: **using a PNG image as a carrier for a temporary, encrypted authentication token**.

The application provides an interactive demonstration where visitors generate two images—one containing a valid hidden credential and one decoy—and test whether the server accepts or rejects them. CerberKey is a **personal portfolio project**. This repository is primarily a showcase of the source code, design choices and technical experiments behind the application—not a packaged library or a ready-to-deploy authentication service.

## Features

- Generate a secure PNG and a decoy PNG in a demonstration session.
- Hide an encrypted authentication token in the RGB pixel data of the secure image using **least significant bit (LSB) steganography**.
- Upload a PNG to verify its embedded credential on the server.
- Identify the associated session from data extracted from the image, without requiring the frontend to submit a separate session ID during verification.
- Reject decoy images, ordinary images without a valid token, and expired credentials.
- Download the generated images or send them by email.
- Display verification feedback in a responsive React interface.
- Support mobile, desktop and ultrawide layouts.

## Project evolution

### V1 — Initial proof of concept

The first iteration established the core idea of authenticating with an image instead of a conventional password. It introduced the interactive demonstration and the frontend/backend flow for generating and testing authentication images.

### V2 — Encrypted steganographic credentials

V2 strengthens the demonstration by moving credential extraction and verification to the backend and introducing a structured hidden payload and temporary database-backed sessions.

Key V2 improvements:

- **Encrypted token:** the credential is encrypted before being hidden in the image.
- **LSB embedding:** authentication data is encoded into the least significant bits of PNG RGB channels.
- **Structured image payload:** a `CBK2` marker, session identifier and nonce support extraction and verification.
- **Derived keys:** HKDF is used to derive separate key material for encryption and token placement.
- **Dispersed payload:** encrypted token bits are placed at pseudorandom positions rather than stored as ordinary visible image metadata.
- **Database-backed sessions:** Prisma and PostgreSQL are used to manage temporary demo sessions and stored token hashes.
- **15-minute validity:** sessions expire automatically for authentication purposes.
- **Server-side checks:** the server validates PNG format, input size and dimensions before extracting hidden data.
- **Timing-safe verification:** extracted credentials are checked against a stored hash using a timing-safe comparison.
- **Stateless verification request:** the client uploads the image; the backend recovers the session identifier from the embedded payload.

## How it works

```text
Visitor (React frontend)
       |
       | POST /api/demo/start
       v
Express API
       |-- Create temporary session (PostgreSQL / Prisma)
       |-- Generate authentication token
       |-- Encrypt and embed token in a PNG (LSB)
       |-- Generate a decoy PNG
       v
Secure image + decoy image
       |
       | Download, email or upload a PNG
       | POST /api/demo/verify
       v
Express API
       |-- Validate PNG input
       |-- Extract hidden marker and session identifier
       |-- Locate session and check expiration
       |-- Extract/decrypt embedded credential
       |-- Verify credential hash
       v
Valid / Invalid response
```

The image acts as a **bearer credential**: possession of a valid image can be sufficient to authenticate during its validity window. The application does not identify a person from the visual appearance of the image.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, SCSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Image processing | Sharp |
| Cryptography | Node.js `crypto` |
| API testing | Postman |

## API design

### `POST /api/demo/start`

Creates a temporary demonstration session and returns two generated images.

Representative response fields:

```json
{
  "sessionId": "<session-uuid>",
  "expiresAt": "<expiration-timestamp>",
  "images": {
    "secured": "<base64-png>",
    "decoy": "<base64-png>"
  }
}
```

### `POST /api/demo/verify`

Accepts a Base64-encoded PNG. **The request does not need a separate `sessionId`.**

```json
{
  "image": "<base64-png>"
}
```

Successful verification:

```json
{
  "valid": true,
  "message": "Image authenticated successfully"
}
```

Unsuccessful verification (example):

```json
{
  "valid": false,
  "message": "No valid token found in this image"
}
```

Expired sessions are rejected as well.

## Tests performed

The following scenarios have been tested manually during development:

| Scenario | Expected result | Observed result |
| --- | --- | --- |
| Upload the freshly generated secure image | Accepted | Passed |
| Upload the decoy image | Rejected | Passed |
| Upload an ordinary PNG | Rejected | Passed |
| Verify an expired demo session | Rejected | Passed |
| Refresh the page, then re-upload a still-valid secure image | Accepted | Passed |
| Send generated images by email | Email received | Passed |
| Edit a secure image extensively in Paint, then upload it | Rejected in this test | Passed |
| Re-upload the unmodified original image | Accepted | Passed |

**Important:** rejection of the Paint-edited image does **not** prove that *every* pixel modification is detected. The current mechanism verifies embedded authentication data, not a cryptographic integrity signature over every pixel of the final image.

## Security considerations

CerberKey is an **educational demonstration**, not a security-audited authentication product.

- **Credential theft:** anyone who obtains a valid secure image may be able to use it before the session expires.
- **Replay:** the current demonstration should not be assumed to prevent repeated use of the same valid image unless explicit one-time-use enforcement is implemented.
- **Image integrity:** some image edits may leave the hidden credential intact. LSB steganography alone is not a full-image tamper-detection mechanism.
- **Image processing:** resizing, recompression or conversion to a lossy format can destroy the embedded bits.
- **Production security:** deployment would require a dedicated threat model, secrets management, abuse controls, logging/privacy review, automated tests and independent security assessment.

The project explores how cryptography, steganography and session validation can work together. **Steganography is not, by itself, a substitute for standard authentication or encryption.**

## Responsive interface

The interface includes a dark visual identity, a Cerberus-themed hero illustration, a mobile layout and adjustments for ultrawide screens. The main hero content remains centered while the background artwork can extend farther, with horizontal and vertical fades into black.

## About this repository

This repository documents the development of CerberKey and makes its source code available for review. It is intended to showcase the implementation and the reasoning behind the project, **not to serve as an installation guide or a reusable authentication package**.

The project is not intended to be offered as a public authentication service or sold to clients in its current form. Its purpose is to demonstrate practical experience with React, backend APIs, databases, cryptography concepts, image processing and testing.

## Author

Personal project by Mael — developed as part of an independent exploration of full-stack web development and image-based authentication.
