import React from 'react';
import { Container, NavDropdown } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap';

import UserService from '../services/user.service';

interface NavigationBarProps {
  isLoggedIn: boolean;
  userEmail: string;
}

const AppNavBar: React.FC<NavigationBarProps> = ({ isLoggedIn, userEmail }) => {
  const handleSignOut = () => {
    UserService.signout().then((response) => {
      if (response && response.status === 200) {
        window.location.reload();
      }
    });
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="/">Auction</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        {isLoggedIn ? (
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/bidItems">
                <Nav.Link>Bid Items</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/items">
                <Nav.Link>My Items</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav>
              <NavDropdown title={userEmail} id="navbarScrollingDropdown">
                <NavDropdown.Item>
                  <LinkContainer to="/profile">
                    <Nav.Link>Profile</Nav.Link>
                  </LinkContainer>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item>
                  <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        ) : null}
      </Container>
    </Navbar>
  );
};

export default AppNavBar;
