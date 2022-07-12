import './Header.css';
import React from 'react';
import logo from "../../assets/pareto-logo-2.png";
 
class Header extends React.Component {
  render() {
    const username = "jdoe@lbl.gov" 
    return (
      <div id="Header">
        
        <div className="titlebar">
          <a href="/">
            <div id="nawi_logo">
              <img src={logo} alt="NAWI logo"/>
            </div>
          </a>
          <select disabled name="user-name" id="user-name">
            <option value={username}>{username}</option>
          </select>
        </div>

      </div>
    );
  }
}

export default Header;
