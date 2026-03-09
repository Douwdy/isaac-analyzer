import React from 'react';
import '../styles/FileUploader.css';

function FileUploader({ onFileSelect, isLoading, error, fileInputRef }) {
  return (
    <section className="uploader-section">
      <div className="uploader-card">
        <div className="uploader-icon">📁</div>
        
        <h2>Importez votre sauvegarde</h2>
        <p className="uploader-description">
          Localisez votre fichier de sauvegarde Isaac sur votre ordinateur
        </p>

        <label htmlFor="file-input" className="file-input-label">
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Lecture en cours...
            </>
          ) : (
            <>
              <span className="upload-icon">⬆️</span>
              Cliquez ou déposez un fichier .dat
            </>
          )}
        </label>

        <input
          ref={fileInputRef}
          id="file-input"
          type="file"
          accept=".dat"
          onChange={onFileSelect}
          disabled={isLoading}
          className="file-input-hidden"
        />

        <p className="file-path-hint">
          💡 Chemin typique de la sauvegarde:
          <br />
          <code>C:\Users\[YourName]\AppData\Roaming\The Binding of Isaac Rebirth\</code>
        </p>

        <div className="supported-dlc">
          <h4>✅ DLC supportés:</h4>
          <ul>
            <li>✓ The Binding of Isaac: Rebirth</li>
            <li>✓ Afterbirth</li>
            <li>✓ Repentance</li>
            <li>✓ Repentance+</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default FileUploader;
