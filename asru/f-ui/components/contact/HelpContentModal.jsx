import React from 'react';
import SparkleIcon from './SparkleIcon'; // Import the custom icon
import './HelpContentModal.scss';
import { Button } from '@uhg-abyss/web/ui/Button';

const HelpContentModal = ({ open, onClose }) => {
  const supportEmail = "CenXFormatter_Support@ds.uhc.com";
 const trainingDocumentUrl = 'https://s3api-core.uhc.com/renewal-xml-dev/Internal%20Sales_Census%20X-Formatter.docx' // the actual path to your Word document

  // const trainingDocumentUrl = "https://renewal-xml-dev.s3api-core.uhc.com/Census-X-Formatter%20Tool_v1.0.docx"; // Replace with the actual path to your Word document
   
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = trainingDocumentUrl;
    console.log("Downloading training document from:", trainingDocumentUrl);
    link.download = trainingDocumentUrl; // Specify the file name
    link.click();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="small"
      className="help-modal-container"
    >
      <Modal.Content className="help-modal-content">
        <div className="help-header">
          <SparkleIcon className="help-icon" />
          <span>Help Content</span>
        </div>

        <div className="help-body">
          <p>For any questions or help, contact:</p>
          <p className="email-contact">
            CenXFormatter_Support{' '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
        </div>
<div onClick={handleDownload}>heeee</div>
        <div className="help-actions">
          <Button className="download-button" onClick={handleDownload}>
            Download Training Document
          </Button>
          <Button className="close-button" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default HelpContentModal;