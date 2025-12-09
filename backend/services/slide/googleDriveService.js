import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to credentials file (should be in backend root or config)
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export const uploadFileToDrive = async (fileObject) => {
    try {
        let auth;
        if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            // Use OAuth 2.0 (User Account)
            const { client_secret, client_id, redirect_uris } = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uris: ['https://developers.google.com/oauthplayground']
            };
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
            auth = oAuth2Client;
        } else {
            // Use Service Account (Fallback)
            if (!fs.existsSync(CREDENTIALS_PATH)) {
                console.warn('⚠️ Google Drive credentials not found. Using mock link.');
                return {
                    webViewLink: MOCK_DRIVE_LINK,
                    webContentLink: MOCK_DRIVE_LINK,
                    fileId: 'mock-file-id'
                };
            }
            auth = new google.auth.GoogleAuth({
                keyFile: CREDENTIALS_PATH,
                scopes: SCOPES,
            });
        }

        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: fileObject.originalname,
            parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
        };

        const media = {
            mimeType: fileObject.mimetype,
            body: fs.createReadStream(path.resolve(fileObject.path)),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true,
        });

        // Make file public (optional, depending on requirements)
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Clean up uploaded file from server
        try {
            fs.unlinkSync(path.resolve(fileObject.path));
        } catch (err) {
            console.error('Error deleting local file:', err);
        }

        return response.data;

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        // Attempt to clean up file even on error
        try {
            if (fs.existsSync(path.resolve(fileObject.path))) {
                fs.unlinkSync(path.resolve(fileObject.path));
            }
        } catch (cleanupErr) {
            console.error('Error cleaning up local file after failure:', cleanupErr);
        }
        throw error;
    }
};

// Get file stream from Google Drive
export const getFileStream = async (fileId) => {
    try {
        let auth;
        if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            const { client_secret, client_id, redirect_uris } = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uris: ['https://developers.google.com/oauthplayground']
            };
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
            auth = oAuth2Client;
        } else {
            auth = new google.auth.GoogleAuth({
                keyFile: CREDENTIALS_PATH,
                scopes: SCOPES,
            });
        }

        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media',
        }, { responseType: 'stream' });

        return response.data;
    } catch (error) {
        console.error('Error getting file stream from Drive:', error);
        throw error;
    }
};
