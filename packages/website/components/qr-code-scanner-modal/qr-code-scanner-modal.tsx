import React from "react";
import Modal from "react-modal";
// @ts-ignore
import QrScanner from "react-qr-reader";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

type Props = {
  isOpen: boolean;
  onScan: (scannedData: string) => void;
  onError: (error: Error) => void;
  onRequestClose: () => void;
};

function QrCodeScannerModal(props: Props) {
  const handleScan = (scannedData: any) => {
    if (scannedData) {
      props.onScan(scannedData);
      props.onRequestClose();
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      style={customStyles}
      onRequestClose={props.onRequestClose}
    >
      <div className="w-96">
        <QrScanner
          delay={300}
          onError={props.onError}
          onScan={handleScan}
          style={{ width: "100%" }}
        />
      </div>
    </Modal>
  );
}

export { QrCodeScannerModal };
