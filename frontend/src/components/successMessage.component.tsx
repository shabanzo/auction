import React, { useEffect, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';

import { useSuccess } from '../contexts/success.context';

const SuccessMessage = () => {
  const { success, clearSuccesss } = useSuccess();
  const [show, setShow] = useState(false);

  const closeAlert = () => {
    setShow(false);
    clearSuccesss();
  };

  useEffect(() => {
    if (success.length > 0) {
      setShow(true);
    }
  }, [success]);

  return show ? (
    <Container>
      <Alert
        variant={'success'}
        onClose={() => closeAlert()}
        className="pt-4"
        dismissible
      >
        <ul>
          {Array.from(success).map((success, index) => (
            <li key={index}>{success}</li>
          ))}
        </ul>
      </Alert>
    </Container>
  ) : (
    <></>
  );
};

export default SuccessMessage;
