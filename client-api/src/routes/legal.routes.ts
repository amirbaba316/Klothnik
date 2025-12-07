import { Router } from 'express';
import path from 'path';
import express from 'express';

const router = Router();

// __dirname here will be: build/routes in production
// So ../services/templates -> build/services/templates
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

router.use('/assets', express.static(path.join(TEMPLATES_DIR, 'assets')));

router.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(TEMPLATES_DIR, 'privacy-policy.html'));
});

router.get('/terms', (req, res) => {
    res.sendFile(path.join(TEMPLATES_DIR, 'terms.html'));
});

router.get('/delete-account', (req, res) => {
    res.sendFile(path.join(TEMPLATES_DIR, 'account-deletion.html'));
});

export default router;
