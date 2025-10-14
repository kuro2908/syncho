import React from 'react';
import styled from 'styled-components';

const StyledTextarea = ({ value, onChange, placeholder, className = "" }) => {
  return (
    <StyledWrapper className={className}>
      <div className="textarea-container">
        <textarea 
          id="styled-textarea" 
          value={value}
          onChange={onChange}
          required 
        />
        <label htmlFor="styled-textarea" className="label">{placeholder}</label>
        <div className="underline" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .textarea-container {
    position: relative;
    width: 100%;
  }

  .textarea-container textarea {
    font-size: 18px;
    width: 100%;
    min-height: 400px;
    border: none;
    border-bottom: 2px solid #475569;
    padding: 5px 0;
    background-color: transparent;
    outline: none;
    color: #e2e8f0;
    resize: vertical;
    line-height: 1.8;
    font-family: inherit;
  }

  .textarea-container .label {
    position: absolute;
    top: 0;
    left: 0;
    color: #64748b;
    transition: all 0.3s ease;
    pointer-events: none;
    font-size: 18px;
  }

  .textarea-container textarea:focus ~ .label,
  .textarea-container textarea:valid ~ .label {
    top: -20px;
    font-size: 14px;
    color: #38bdf8;
  }

  .textarea-container .underline {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background-color: #38bdf8;
    transform: scaleX(0);
    transition: all 0.3s ease;
  }

  .textarea-container textarea:focus ~ .underline,
  .textarea-container textarea:valid ~ .underline {
    transform: scaleX(1);
  }
`;

export default StyledTextarea;
