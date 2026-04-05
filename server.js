const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

/**
 * API Endpoint: /api/scan
 * Routes requests to the Specter Python Bridge (lb_bridge.py).
 */
app.get('/api/scan', async (req, res) => {
    const { target, module, secondary } = req.query;

    if (!target || !module) {
        return res.status(400).json({ error: 'Missing target or module parameters.' });
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const args = ['lb_bridge.py', '--module', module, '--target', `"${target}"`];
    if (secondary) {
        args.push('--secondary', `"${secondary}"`);
    }
    
    const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
    console.log(`[EXEC] ${pythonBin} ${args.join(' ')}`);
    
    // Spawn Specter bridge
    const child = spawn(pythonBin, args, {
        cwd: process.cwd(),
        shell: false
    });

    child.stdout.on('data', (data) => {
        res.write(data.toString());
    });

    child.stderr.on('data', (data) => {
        res.write(`\n[ERROR] ${data.toString()}\n`);
    });

    child.on('close', (code) => {
        res.write(`\n[SYSTEM] Specter module '${module}' finished with exit code ${code}\n`);
        res.end();
    });

    child.on('error', (err) => {
        res.write(`\n[CRITICAL ERROR] Failed to start Specter: ${err.message}\n`);
        res.end();
    });
});

// ═══════════════════════════════════════════════════════════
// NEW HIGH-SPEED OSINT APIS (NATIVE NODE.JS INTEGRATIONS)
// ═══════════════════════════════════════════════════════════

/**
 * IP-API for ultra-fast Geo IP / ASN lookups
 */
app.get('/api/fast-ip', async (req, res) => {
    const { target } = req.query;
    if (!target) return res.status(400).json({ error: 'Target IP needed' });
    try {
        const response = await fetch(`http://ip-api.com/json/${target}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
        const data = await response.json();
        
        // Format to resemble Specter JSON for the frontend
        res.json({
            status: 'Success',
            IP_Data: data,
            notes: ['[+] Data retrieved instantly via IP-API integration']
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to reach IP-API: ' + e.message });
    }
});

const exifr = require('exifr');
const { parsePhoneNumber, isValidPhoneNumber, getCountryCallingCode } = require('libphonenumber-js');

/**
 * Link X-Ray (Unshortener & Scanner)
 */
app.get('/api/link-xray', async (req, res) => {
    const { target } = req.query;
    if (!target) return res.status(400).json({ error: 'Target URL needed' });
    try {
        const response = await fetch(target, { redirect: 'manual' });
        const finalUrl = response.headers.get('location') || target;
        res.json({
            status: 'Success',
            Link_Intelligence: {
                original_url: target,
                final_destination: finalUrl,
                is_redirect: response.status >= 300 && response.status < 400 ? 'Yes' : 'No',
                safety: 'Pending SafeBrowsing Verification'
            },
            notes: ['[+] Unshortened link successfully']
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to unshorten: ' + e.message });
    }
});

/**
 * Image Forensics (EXIF Data Extractor) - URL
 */
app.get('/api/exif', async (req, res) => {
    const { target } = req.query;
    if (!target) return res.status(400).json({ error: 'Image URL needed' });
    try {
        const response = await fetch(target);
        if (!response.ok) throw new Error('Could not fetch image');
        const buffer = await response.arrayBuffer();
        
        const output = await exifr.parse(buffer);
        
        if (!output || Object.keys(output).length === 0) {
            return res.json({
                status: 'Success',
                Image_Data: { message: "No EXIF metadata found. This image may have been stripped for privacy (e.g., social media upload, screenshot)." },
                notes: ['[+] Image processed', '[-] No hidden metadata available']
            });
        }
        
        res.json({
            status: 'Success',
            Image_Data: output,
            notes: ['[+] EXIF data extracted instantly']
        });
    } catch (e) {
        res.status(500).json({ error: 'EXIF Extraction Failed: ' + e.message });
    }
});

/**
 * Image Forensics (EXIF Data Extractor) - File Upload
 */
app.post('/api/exif-upload', async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image file needed' });
    try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        const output = await exifr.parse(buffer);
        
        if (!output || Object.keys(output).length === 0) {
            return res.json({
                status: 'Success',
                Image_Data: { message: "No EXIF metadata found. This image may have been stripped for privacy." },
                notes: ['[+] Local file processed', '[-] No hidden metadata available']
            });
        }
        
        res.json({
            status: 'Success',
            Image_Data: output,
            notes: ['[+] Local file parsed', '[+] EXIF metadata extracted successfully']
        });
    } catch (e) {
        res.status(500).json({ error: 'EXIF Extraction Failed: ' + e.message });
    }
});

/**
 * Phone Intelligence (libphonenumber - No Auth Required)
 */
app.get('/api/spam-phone', async (req, res) => {
    const { target } = req.query;
    if (!target) return res.status(400).json({ error: 'Target Phone needed' });
    try {
        const phoneNumber = parsePhoneNumber(String(target));
        
        if (!phoneNumber) throw new Error('Could not parse this phone number.');

        const intel = {
            phone: phoneNumber.number,
            country: phoneNumber.country || 'Unknown',
            country_code: phoneNumber.countryCallingCode || 'N/A',
            national_format: phoneNumber.formatNational() || target,
            international_format: phoneNumber.formatInternational() || target,
            type: phoneNumber.getType() || 'Unknown (Possible Mobile)',
            is_valid: phoneNumber.isValid() ? 'Yes - Valid Number' : 'No - Invalid Number',
            is_possible: phoneNumber.isPossible() ? 'Yes' : 'No',
            uri: phoneNumber.getURI() || 'N/A'
        };

        res.json({
            status: 'Success',
            Phone_Intelligence: intel,
            notes: ['[+] Phone parsed via Google libphonenumber', '[+] No authentication required']
        });
    } catch (e) {
        res.status(500).json({ error: 'Phone Intel Failed: ' + e.message + '. Make sure to include country code (e.g., +91XXXXXXXXXX)' });
    }
});

app.listen(PORT, () => {
    console.log(`Specter Intelligence Dashboard running at http://localhost:${PORT}`);
    console.log(`Serving static files from: ${__dirname}`);
});
