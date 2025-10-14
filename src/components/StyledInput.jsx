import React from 'react';
import styled from 'styled-components';

const StyledInput = ({ value, onChange, placeholder, type = "text", className = "" }) => {
  return (
    <StyledWrapper className={className}>
      <div className="input-container">
        <input 
          type={type} 
          id="styled-input" 
          value={value}
          onChange={onChange}
          required 
        />
        <label htmlFor="styled-input" className="label">{placeholder}</label>
        <div className="underline" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .input-container {
    position: relative;
    width: 100%;
  }

  .input-container input[type="text"] {
    font-size: 20px;
    width: 100%;
    border: none;
    border-bottom: 2px solid #475569;
    padding: 5px 0;
    background-color: transparent;
    outline: none;
    color: #fff;
  }

  .input-container .label {
    position: absolute;
    top: 0;
    left: 0;
    color: #64748b;
    transition: all 0.3s ease;
    pointer-events: none;
    font-size: 20px;
  }

  .input-container input[type="text"]:focus ~ .label,
  .input-container input[type="text"]:valid ~ .label {
    top: -20px;
    font-size: 16px;
    color: #38bdf8;
  }

  .input-container .underline {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background-color: #38bdf8;
    transform: scaleX(0);
    transition: all 0.3s ease;
  }

  .input-container input[type="text"]:focus ~ .underline,
  .input-container input[type="text"]:valid ~ .underline {
    transform: scaleX(1);
  }
`;

export default StyledInput;
