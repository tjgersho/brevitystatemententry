import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from '../Input';

describe('Running Test for Input', () => {
  it('Check placeholder in Input', () => {
    const placeholder = 'Hello UI Component!';
    render(<Input placeholder={placeholder} />);
    expect(screen.getByPlaceholderText('Hello UI Component!')).toHaveAttribute(
      'placeholder',
      placeholder
    );
  });

  it('renders the Input Component',  async () => {
    const beforePlaceholder = 'before';
    const afterInput = 'after';
 
    render(<Input placeholder={beforePlaceholder} />);
    const input = screen.getByPlaceholderText(beforePlaceholder) as HTMLInputElement;
    fireEvent.change(input, { target: { value: afterInput }});
    expect(input.value).toBe(afterInput);
  });


});