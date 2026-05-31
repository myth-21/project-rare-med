# TODO - Remove SMTP/Nodemailer from Rare Med

## Step 1
Understand SMTP integration points (done).

## Step 2
Replace `Backend/services/emailService.js` with a non-SMTP stub exporting compatible functions (done).

## Step 3
Update `Backend/controllers/authController.js`:
- Registration: exact success message (done).
- Forgot-password: remove SMTP email sending attempt (done).

## Step 4
Update `Backend/controllers/testEmailController.js` to disable SMTP test endpoint (done).

## Step 5
Update `Backend/config/validateEnv.js` to remove SMTP env warnings (done).

## Step 6
Remove nodemailer dependency from `Backend/package.json` and run `npm install` (done).

## Step 7
Remove SMTP env vars from env example files (pending: tool prevents reading/writing .env contents).

## Step 8
Ensure project builds/starts successfully (done; server running).

