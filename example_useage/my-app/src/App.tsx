import React from 'react';
import {BrevityStatementEntry, AudienceType, BSEProps} from 'brevitystatemententry';


function App() {
  var props : BSEProps = {
    id: "someId",
    apiBase: "httpS://intel.brevitypitch.com",
    audience: AudienceType.Bold,
    textAreaStyles: {background: "#eeefff"},
    label: "",
    error: false,
    success: false,
    disabled: false,
    onChange: (e)=>{console.log("Change:", e.target.value)},
    onBlur: (e)=>{console.log("Blur:", e.target.value)},
    textViewStyles: {fontSize: 20}
  };
  return (
    <React.Fragment>
    <div style={{width: 1000, marginLeft: 20}}>
      <BrevityStatementEntry  {...props} />
    </div>


    <div style={{display: 'flex', justifyContent: 'center',  alignItems: 'center',  marginLeft: 20, marginRight: 20}}>
      <div style={{width: "80%"}}>
       <BrevityStatementEntry  {...props} />
      </div>
    </div>

    <div style={{display: 'flex', justifyContent: 'center',  alignItems: 'center',  margin: 20}}>
      <BrevityStatementEntry  {...{...props, ...{textAreaStyles:{borderWidth: 10, borderRadius: 19, height: 100, resize: 'none', overflow: 'auto', fontSize: 90}}}} />
    </div>

    <div style={{display: 'flex', justifyContent: 'center',  alignItems: 'center',  margin: 100}}>
      <BrevityStatementEntry  {...{...props, ...{textAreaStyles:{backgroundColor: 'orange'}, label: "Tell me something:"}}} />
    </div>
    </React.Fragment> 
  );
}

export default App;
