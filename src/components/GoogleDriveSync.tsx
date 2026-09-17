import React, { useState } from 'react';
import { useStore } from '../store';
import {
  Cloud,
  CloudOff,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import {
  simulateSync,
  simulateDownload,
} from '../utils/googleDrive';

export default function GoogleDriveSync() {
  const { files, setFiles, syncStatus, setSyncStatus } = useStore();
  const [showDetails, setShowDetails] = useState(false);

  const handleUpload = async () => {
    setSyncStatus({ isSyncing: true, error: null });
    try {
      await simulateSync(files);
      setSyncStatus({
        isSyncing: false,
        lastSynced: Date.now(),
        isConnected: true,
      });
    } catch (err) {
      setSyncStatus({
        isSyncing: false,
        error: 'Failed to upload to Google Drive',
      });
    }
  };

  const handleDownload = async () => {
    setSyncStatus({ isSyncing: true, error: null });
    try {
      const data = await simulateDownload();
      if (data) {
        setFiles(data);
        setSyncStatus({
          isSyncing: false,
          lastSynced: Date.now(),
          isConnected: true,
        });
      } else {
        setSyncStatus({
          isSyncing: false,
          error: 'No vault found on Google Drive',
        });
      }
    } catch (err) {
      setSyncStatus({
        isSyncing: false,
        error: 'Failed to download from Google Drive',
      });
    }
  };

  const handleConnect = async () => {
    setSyncStatus({ isSyncing: true, error: null });
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSyncStatus({
      isConnected: true,
      isSyncing: false,
      lastSynced: Date.now(),
    });
  };

  const handleDisconnect = () => {
    setSyncStatus({
      isConnected: false,
      lastSynced: null,
      isSyncing: false,
      error: null,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#2a2d3e]">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Google Drive Sync
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Connection Status */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            {syncStatus.isConnected ? (
              <>
                <Cloud size={18} className="text-green-400" />
                <span className="text-sm text-green-400">Connected</span>
              </>
            ) : (
              <>
                <CloudOff size={18} className="text-gray-500" />
                <span className="text-sm text-gray-500">Disconnected</span>
              </>
            )}
          </div>

          {!syncStatus.isConnected ? (
            <button
              onClick={handleConnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
            >
              <Cloud size={14} />
              Connect Google Drive
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2d3e] hover:bg-[#3a3d4e] text-gray-300 rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Sync Actions */}
        {syncStatus.isConnected && (
          <div className="space-y-2 mb-4">
            <button
              onClick={handleUpload}
              disabled={syncStatus.isSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2d3e] hover:bg-[#3a3d4e] text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Upload size={14} />
              Upload Vault
            </button>
            <button
              onClick={handleDownload}
              disabled={syncStatus.isSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2d3e] hover:bg-[#3a3d4e] text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              Download Vault
            </button>
          </div>
        )}

        {/* Status */}
        {syncStatus.isSyncing && (
          <div className="flex items-center gap-2 text-sm text-yellow-400 mb-3">
            <Loader size={14} className="animate-spin" />
            Syncing...
          </div>
        )}

        {syncStatus.error && (
          <div className="flex items-center gap-2 text-sm text-red-400 mb-3">
            <AlertCircle size={14} />
            {syncStatus.error}
          </div>
        )}

        {syncStatus.lastSynced && !syncStatus.isSyncing && (
          <div className="flex items-center gap-2 text-sm text-green-400 mb-3">
            <CheckCircle size={14} />
            Last synced: {new Date(syncStatus.lastSynced).toLocaleTimeString()}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-[#2a2d3e] rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Note:</strong> This demo uses local storage to simulate Google Drive sync. 
            In production, this would connect to the Google Drive API to sync your vault.
          </p>
        </div>

        {/* Vault Stats */}
        <div className="mt-4 p-3 bg-[#2a2d3e] rounded-lg">
          <p className="text-xs text-gray-400 mb-2 font-medium">Vault Statistics</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">
              Files: <span className="text-gray-300">{files.filter(f => f.type === 'file').length}</span>
            </div>
            <div className="text-gray-500">
              Folders: <span className="text-gray-300">{files.filter(f => f.type === 'folder').length}</span>
            </div>
            <div className="text-gray-500">
              Size: <span className="text-gray-300">{(JSON.stringify(files).length / 1024).toFixed(1)} KB</span>
            </div>
            <div className="text-gray-500">
              Tags: <span className="text-gray-300">{new Set(files.flatMap(f => f.tags || [])).size}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
