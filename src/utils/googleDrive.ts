import { FileNode } from '../types';

// Google Drive API configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

export function initializeGoogleApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Google API scripts are loaded
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    // Load gapi script
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      // Load gis script
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = () => {
        try {
          (window as any).gapi.load('client', async () => {
            try {
              await (window as any).gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
              });
              gapiInited = true;
              
              tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: () => {},
              });
              gisInited = true;
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        } catch (err) {
          reject(err);
        }
      };
      gisScript.onerror = reject;
      document.head.appendChild(gisScript);
    };
    gapiScript.onerror = reject;
    document.head.appendChild(gapiScript);
  });
}

export async function authenticateGoogleDrive(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google API not initialized'));
      return;
    }

    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(true);
    };

    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

export async function signOutGoogleDrive(): Promise<void> {
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    await (window as any).google.accounts.oauth2.revoke(token.access_token);
    (window as any).gapi.client.setToken('');
  }
}

export async function uploadToGoogleDrive(files: FileNode[]): Promise<void> {
  const content = JSON.stringify(files, null, 2);
  const metadata = {
    name: 'obsidian-vault.json',
    mimeType: 'application/json',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  try {
    // Check if file already exists
    const searchResponse = await (window as any).gapi.client.drive.files.list({
      q: "name='obsidian-vault.json' and mimeType='application/json'",
      fields: 'files(id, name)',
    });

    const existingFiles = searchResponse.result.files;

    if (existingFiles && existingFiles.length > 0) {
      // Update existing file
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFiles[0].id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${(window as any).gapi.client.getToken().access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });
    } else {
      // Create new file
      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(window as any).gapi.client.getToken().access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });
    }
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

export async function downloadFromGoogleDrive(): Promise<FileNode[]> {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: "name='obsidian-vault.json' and mimeType='application/json'",
      fields: 'files(id, name)',
    });

    const files = response.result.files;
    if (!files || files.length === 0) {
      throw new Error('No vault file found on Google Drive');
    }

    const fileContent = await (window as any).gapi.client.drive.files.get({
      fileId: files[0].id,
      alt: 'media',
    });

    return JSON.parse(fileContent.body);
  } catch (error) {
    console.error('Error downloading from Google Drive:', error);
    throw error;
  }
}

export function isGoogleApiAvailable(): boolean {
  return gapiInited && gisInited;
}

// Simulated sync for demo purposes
export async function simulateSync(files: FileNode[]): Promise<void> {
  // Save to localStorage as a simulation
  localStorage.setItem('obsidian-vault-sync', JSON.stringify(files));
  localStorage.setItem('obsidian-vault-sync-time', Date.now().toString());
}

export async function simulateDownload(): Promise<FileNode[] | null> {
  const data = localStorage.getItem('obsidian-vault-sync');
  if (data) {
    return JSON.parse(data);
  }
  return null;
}
