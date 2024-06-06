'use client'
import { useEffect, useState } from 'react';
import { listFilesInComputingFolder } from '../lib/googleDrive';

interface DriveFile {
  id: string;
  name: string;
}

function Home() {
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    async function fetchFiles() {
      const filesList = await listFilesInComputingFolder();
      setFiles(filesList);
    }

    fetchFiles();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <h1>Files in Computing-Folder:</h1>
      <ul>
        {files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
