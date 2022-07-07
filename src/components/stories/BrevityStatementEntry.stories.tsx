import React from 'react';
import { Story, Meta } from '@storybook/react';
import BrevityStatementEntry  from '../BrevityStatementEntry';
import {AudienceType, BSEProps} from "../BrevityStatementEntry.types"

export default {
  title: 'Marbella/Input',
  component: BrevityStatementEntry,
  argTypes: {
  },
} as Meta<typeof BrevityStatementEntry>;

const Template: Story<BSEProps>  = (args)=>{
 
  return <BrevityStatementEntry {...args} />;
};

 
export const Primary = Template.bind({});
Primary.args = {
  error: false,
  disabled: false,
  label: 'Primary',
};

export const Success = Template.bind({});
Success.args = {
  error: false,
  success:true,
  disabled: false,
  label: "Success",
};

export const Error = Template.bind({});
Error.args = {
  error: true,
  disabled: false,
  message: "Error",
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Disabled',
};