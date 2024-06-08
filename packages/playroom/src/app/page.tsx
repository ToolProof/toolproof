'use client'
import { useEffect, useState } from 'react';
import { readFile } from '../lib/googleDrive';
import ReactMarkdown from 'react-markdown';


function Home() {
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    async function fetchFile() {
      const fileContentLocal = await readFile('1GMwp5zZgmfip5N0heqBe0V_WOzdrJK1tvZAlQsCtdvk');
      setFileContent(fileContentLocal);
    }
    fetchFile();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* <p>{fileContent}</p> */}
      <ReactMarkdown
        components={{
          ul: ({ node, ...props }) => <ul style={styles.ul} {...props} />,
          li: ({ node, ...props }) => <li style={styles.li} {...props} />,
        }}>
        {fileContent}</ReactMarkdown>
    </div >
  );

}

const styles = {
  ul: {
    listStyleType: 'disc',
    marginLeft: '20px',
    paddingLeft: '20px',
  },
  li: {
    marginBottom: '5px',
  },
};

export default Home;
