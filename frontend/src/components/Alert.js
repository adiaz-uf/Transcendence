import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Register from '../pages/Register';
import { Link } from "react-router-dom";

function AlertDismissibleExample() {
  const [show, setShow] = useState(true);

  if (show) {
    return (
      <>
      <Link to='/register'>
      <Alert variant="danger" onClose={() => setShow(false)} dismissible>
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        <p>
          Change this and that and try again. Duis mollis, est non commodo
          luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
          Cras mattis consectetur purus sit amet fermentum.
        </p>
      </Alert>
      </Link>
      <Register />
      </>
    );
  }
  
}

export default AlertDismissibleExample;