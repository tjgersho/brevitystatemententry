import React from "react";
import { AudienceType, WordingOptimization, BSEProps  } from "./BrevityStatementEntry.types";

import AiBnt from "./AiBtn";
import loader from './loader.gif';
import BackBtn from './BackBtn';


import {GrClose, GrSave} from 'react-icons/gr';
import { FaSpellCheck, FaChevronDown, FaChevronUp, FaPencilAlt, FaSave, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {getCompletions, getGrammer} from '../apis/openai';
import "./bsestyles.css"

type BSEState = {
  loading: boolean;
  sort: number;
  maxWidth: number;
  suggestions: {[id:string]:Suggestion};
  statementEntry: string;
  textAreaHeight: number;
  textAreaSizeChanging: boolean;
  showHideSuggestions: boolean;
  editMode: boolean;
  history: string[],
  historyPointer: number
}


interface Suggestion {
  id: string,
  statement: string,
  sort: number
}
 

class BrevityStatementEntry extends React.PureComponent<BSEProps, BSEState> {
  
   public state: BSEState = {
     loading: false,
     sort: 0,
     maxWidth: 100,
     suggestions: {},
     textAreaHeight: 100,
     statementEntry: "",
     textAreaSizeChanging: false,
     showHideSuggestions: true,
     editMode: false,
     history: [],
     historyPointer: -1
   };


   static defaultProps = {
      label: "Enter a single pitch statement.",
      placeholder: "Write your statement here.",
      apiBase: "https://intel.brevitypitch.com",
      activateAI: false,
      doGrammer: false,
      active: true,
      showSave: false,
      doSuggestionList: false,
      editMode: false,
      btnStyles: {
        color: "green",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" 
      }
   };

   private btnStyleDefault: any =  {
      border: 'none', 
      cursor:'pointer',
      background: '#fff', 
      borderRadius: 10, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 5
    };

   private textRef: React.RefObject<HTMLTextAreaElement> = React.createRef<HTMLTextAreaElement>();

    public componentDidMount(){
        if(this.props.reference){
            this.textRef = this.props.reference;
        } else if(this.textRef.current){
            this.textRef.current.style.height = "100px";
        }
        if(this.props.value){
            this.setState({statementEntry: this.props.value});
        }
        if(this.props.editMode){
            this.setState({editMode: true});
        }

    }

   public componentDidUpdate(){
    if(this.props.reference && this.textRef.current){
      this.textRef.current.style.height = this.textRef.current.scrollHeight + "px";
      this.textRef.current.focus();
    }
    if(this.props.value){
      if(this.props.value != this.state.statementEntry){
        this.setState({statementEntry: this.props.value});
      }
    }
   }
 

   public componentWillReceiveProps(nextProps: BSEProps){
    if(nextProps.editMode != undefined){
      if(nextProps.editMode != this.props.editMode){
        this.setState({editMode: nextProps.editMode});
      }
    }
   }

  private onStatementChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    this.setState({statementEntry: e.target.value});
    if(this.textRef.current){
      this.textRef.current.style.height = (this.textRef.current.scrollHeight -20 ) + "px";
    }
  }
  
  private getRandomSuccinctSynonym(){
    var synonymList = ["succinct", "blunt", "precise", "direct", "simple", "straightforward", "breif", "terse", "compact", "short"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }

  private getRandomClaritytSynonym(){
    var synonymList = ["accurate", "comprehensive", "intelligent", "explicit", "certain", "positive", "trustworthy", "clear"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }

  private getRandomAspirationSynonym(){
    var synonymList = ["dreamy", "aspirational", "ambition", "spirited", "motivational", "inspirational", "eager", "longing", "passionate"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }

  private getRandomCompellingSynonym(){
    var synonymList = ["facinating","cogent", "convicing", "persuasive", "alluring", "inspiring", "coersive", "compulsory", "forcible", "compelling"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }
 
 

  private generatePrompt() : string{
      var prepend = "";

      if(this.props.optimizeBy != undefined){
        switch(this.props.optimizeBy){
          case WordingOptimization.Succinctness:
            prepend = "Write a 5 to 30 word persuasive statement that is extreamly " +this.getRandomSuccinctSynonym()+ " similar to: ";
            break;
          case WordingOptimization.Clarity:
            prepend = "Write a 5 to 30 word " +this.getRandomClaritytSynonym()+ " statement similar to: ";
            break;
          case WordingOptimization.Aspiration:
            prepend = "Write a 5 to 30 word very " +this.getRandomAspirationSynonym()+ " statement from the basis: ";
            break;
          case WordingOptimization.Grammar:
            prepend = "Correct this statement for grammer: ";
            break;
          case WordingOptimization.Compelling:
            prepend = "Write a 5 to 30 word " +this.getRandomCompellingSynonym()+ " statement similar to: ";
            break;
          default:
            prepend = "Write a 5 to 30 word persuasive pitch similar to: ";
        }

      }else{

        switch(this.props.audience){
          case AudienceType.Structure:
            prepend = "Write a 5 to 30 word persuasive pitch that is structured and to the point that is similar to: ";
            break;
          case AudienceType.Bold:
            prepend = "Write a 5 to 30 word persuasive pitch that is very bold and similar to: ";
            break;
          case AudienceType.Caring:
            prepend = "Write a 5 to 30 word persuasive pitch that sounds very caring similar to: ";
            break;
          case AudienceType.Intellect:
            prepend = "Write a 5 to 30 word persuasive pitch that sounds very intellectual similar to: ";
            break;
  
          default:
            prepend = "Write a 5 to 30 word persuasive pitch similar to: ";
        }
      }


      return  prepend + this.state.statementEntry;
  }

  private async callLanguageModel(): Promise<void>{
    if(this.props.apiBase){
      this.setState({loading: true, showHideSuggestions: true});
      var response = await getCompletions(this.props.apiBase, this.generatePrompt());
      var addsuggestions = {...this.state.suggestions};
      var nextSort = this.state.sort;
      console.log(response);
      if(response !== "FAILED CALL"){
        //get all responses.
        console.log("REspons...");
        console.log(response);
 
       
        var text = response.suggestion.trim();

        var arrayOfText = text.split(".");
        const reversed = arrayOfText.reverse();
        for(var s of reversed){
          if(s.trim() != ""){
            var newId = "BSt-" + new Date().getTime() + "-ID";
            addsuggestions[newId] = {id: newId, statement: (s + ".").trim(), sort: nextSort};
            nextSort++;
          }
        }

        var newHistory = [...this.state.history];
        console.log("--------");
        console.log(newHistory);
        var nextHistoryPointer = this.state.historyPointer + 1;
        if(newHistory.length == 0){
          newHistory.push(this.state.statementEntry);
          newHistory.splice(1, 0, text);
          nextHistoryPointer = 1;
        }else{
          newHistory.splice(this.state.historyPointer+1, 0, text);
        }
        console.log("*****************");
        
 

        console.log(newHistory);
        
        console.log( this.state.historyPointer );

        console.log("^^^^^^^^^^^^^^^^");

        console.log("NEw History???");
        console.log(newHistory);

        this.setState({
          suggestions:  addsuggestions, 
          loading: false, 
          sort: nextSort, 
          statementEntry: text, 
          history: newHistory, 
          historyPointer: nextHistoryPointer,
        });

        if(this.props.setTextAreaInput){
          this.props.setTextAreaInput(text);
        };
        
      }else{
        var newId = "BSt-" + new Date().getTime() + "-ID";
        addsuggestions[newId] = {id: newId, statement: "Sorry, could not reach the cloud to talk with the AI, check your internet connection and try again later.", sort: nextSort};
        this.setState({suggestions:  addsuggestions, loading: false, sort: nextSort });
      }
    }
  }

 
  private removeSuggestion(s: string){
    var oldsuggestions = {...this.state.suggestions};
    delete oldsuggestions[s];
    this.setState({suggestions:  oldsuggestions});
  }
 
  private saveOldSuggestion(){

    if(this.state.statementEntry.trim() != ""){
      var addsuggestions = {...this.state.suggestions};

      var alreadySaved = false;
      var arrayOfSuggestions = Object.values(addsuggestions);
      for(var s of arrayOfSuggestions){
        if(s.statement === this.state.statementEntry){
          alreadySaved = true;
          break;
        }
      }
      if(!alreadySaved){
        var nextSort = this.state.sort;
        nextSort++;
        var newId = "BSt-" + new Date().getTime() + "-ID";
        addsuggestions[newId] = {id: newId, statement: this.state.statementEntry, sort: nextSort};
        this.setState({suggestions:  addsuggestions, loading: false, sort: nextSort });
      }
    }
  }

  private useSuggestion(s: string){
      this.saveOldSuggestion();

      var useSuggestion = this.state.suggestions[s];
      if(this.textRef.current ){
       this.textRef.current.value = useSuggestion.statement;
       this.setState({statementEntry: useSuggestion.statement});
      }
  }

  private scrollThruStatements(){

    console.log("--------");
    var newHistoryPointer = this.state.historyPointer-1;
    console.log(newHistoryPointer );
    console.log(this.state.history);
    if(newHistoryPointer >=0){
      this.setState({statementEntry: this.state.history[newHistoryPointer], historyPointer: newHistoryPointer});
    }else{
      newHistoryPointer = this.state.history.length-1;
      this.setState({statementEntry: this.state.history[newHistoryPointer], historyPointer: newHistoryPointer});
    }
 
    if(this.props.setTextAreaInput){
      this.props.setTextAreaInput(this.state.history[newHistoryPointer]);
    };
  }
  
  private getStateColor() : string{
      return (
          this.props.disabled ? 'rgba(0,0,0,0.3)':'black'
      );
  };

  getOptimizeByColor(isText: boolean){

    if(this.props.optimizeBy == undefined){
      if(isText){
        return "#333";
      }
      return 'transparent';
    }
    
    switch(this.props.optimizeBy){
      case WordingOptimization.Succinctness:
        return '#e168ff';
      case WordingOptimization.Aspiration:
        return '#ef6868';
      case WordingOptimization.Clarity:
        return '#7e73ef';
      case WordingOptimization.Compelling:
        return '#a5b3d2';
      case WordingOptimization.Grammar:
        return '#f2d2a3';
    }
 
  }

  render()   {

    if(this.state.editMode){
        return (
          <div id={this.props.id} style={{display: 'flex', flexGrow: 1, fontSize: 18}}>
            {this.props.label ?
            <p style={{color: this.getStateColor(), margin: 10}}>
                {this.props.label}
            </p>
            :null}
            <div style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  flexDirection: 'column'
                  }}
                  >
              <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row'
                  }}
                  >
              <div style={{position: 'relative', flexGrow: 1, display: 'flex'}}>
              <textarea
                ref={this.textRef}
                onChange={(e)=>{this.onStatementChange(e); if(this.props.onChange){ this.props.onChange(e);}}}
                onBlur={(e)=>{if(this.props.onBlur){ this.props.onBlur(e);}}}
                onFocus={(e) => {e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);}}
                disabled={this.props.disabled}
                name={"statementEntry"}
                style={{
                    flexGrow: 1,
                    fontSize: '1.2em',
                    borderRadius: 5, 
                    borderWidth: 0,
                    borderColor: this.getStateColor(),
                    padding: 10,
                    backgroundColor: '#edf2f9',
                    color: this.getOptimizeByColor(true),
                    ...{...this.props.textAreaStyles}
                    }}
                  value={this.state.statementEntry}
                  // error={error}
                  // success={success}
                  placeholder={this.props.placeholder}
                  
              />
              {this.state.history.length >0?
                <div style={{position: 'absolute', right: 3,  display: this.props.active ? "flex" : 'none' , top: 3, fontSize:12}}>
                  {this.state.historyPointer + 1}
                  / 
                  {this.state.history.length > 4 ? <span>(5 max)</span>: <span>{this.state.history.length}</span>}
                </div>
              :null}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems:'center', margin: 5, justifyContent: 'space-around'}}> 
             
                {this.props.active ?
                <div className="tooltipleft"> 
                  <span className="toolttextleft">Get some ideas from our AI.</span>
               
                  <button style={{...this.btnStyleDefault, ...this.props.btnStyles,  ...{cursor: this.state.history.length > 4 ? 'not-allowed': 'pointer'}}} 
                  onClick={()=>{this.callLanguageModel();}}  disabled={this.props.disabled || this.state.history.length > 4}>
                      <div style={{width: 50}}>
                        <AiBnt {...{color: this.props.btnStyles.color || "#333"}}  />
                      </div>
                  </button>
                  </div>
                : null}
       
              {(this.state.history.length > 0 || this.state.loading) && !this.props.doSuggestionList ?
                  <button 
                      style={{...this.btnStyleDefault, ...this.props.btnStyles,  marginTop:5 }}
                      onClick={()=>{this.scrollThruStatements()}} 
                      disabled={this.props.disabled}
                      >
                        {this.state.loading ? 
                           <img src={loader} style={{width: 30, height: 30}}/>
                        :  
                          
                           <BackBtn {...{color: this.props.btnStyles.color || "#333"}} />
                    
                        }
                  </button>
                :null}

                {this.props.showSave? 
                  <button 
                    style={{...this.btnStyleDefault, ...this.props.btnStyles, marginTop:5, marginBottom: 5}}
                    onClick={
                      ()=>{
                        if(this.props.onSave){
                          this.props.onSave(this.state.statementEntry); 
                        }
                        console.log("SAVE>>");
                        this.setState({editMode: false})
                      }} 
                      disabled={this.props.disabled}
                      >
                        <div style={{width: 50, height:50, display: 'flex', alignItems: 'center',justifyContent: 'center'}}> 
                          <FaSave style={{width: 25, height: 25}}/>
                        </div>
                  </button>
                : null}

                

              </div>

            </div>

           
              {this.props.doSuggestionList ?
              <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{justifyContent: 'center', display: Object.keys(this.state.suggestions).length > 0  || this.state.loading ? 'flex': 'none'}}>
                      <button 
                        style={{border: 'none', cursor:'pointer', background: '#fff',  borderRadius: 10, display: 'flex', alignItems: 'center', height: 35, boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", marginTop: -20 }}
                        onClick={()=>{this.setState({showHideSuggestions: !this.state.showHideSuggestions})}} 
                        disabled={this.props.disabled}
                        >
                          {this.state.loading ? 
                                <img src={loader} style={{width: 30, height: 30}}/>
                          : <React.Fragment>
                                {this.state.showHideSuggestions ? <FaChevronUp style={{width: 30, height: 30}}/> :  <FaChevronDown style={{width: 30, height: 30}}/>}
                          </React.Fragment>
                          }
                      </button>
                    </div>

                  {this.state.showHideSuggestions ?   
                    <div style={{display: 'flex', flexDirection: 'column', overflowX: 'hidden', maxHeight: 500, marginLeft: 20, marginRight: 20}}>
                      {Object.values(this.state.suggestions).sort((a: Suggestion, b: Suggestion)=>{
                        return a.sort > b.sort ? -1 : 0;
                      }).map((s)=>{
                        return (
                            <div style={{
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: 10,
                              borderRadius: 10,
                              marginBottom: 10,
                              marginTop: 5,
                              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px"}}>

                                <div style={{display: 'flex', alignItems: 'center', flexGrow: 1, fontSize: '1.5em'}}>
                                  {s.statement}
                                </div>

                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                                  <button style={{border: 'none', cursor:'pointer', background: 'transparent', padding: 0, fontSize: 30}} onClick={()=>{this.removeSuggestion(s.id)}}  disabled={this.props.disabled}><GrClose /></button>

                                  <button style={{border: 'none', cursor:'pointer',  background: 'transparent', padding: 0, fontSize: 30, marginTop: 30}} onClick={()=>{this.useSuggestion(s.id)}}  disabled={this.props.disabled}><GrSave className="rotateimg180"/></button>
                                </div>

                            </div>
                          );
                      })}

                      </div>

                  : null}
            </div>
            :null}
                  
            </div>

            
          </div>
        );
    }

   if(!this.state.editMode){
      return (
        <div style={{display: 'flex', justifyContent: 'space-between', }}> 
            <div style={{flexGrow: 1, color: this.props.active ? this.getOptimizeByColor(true) : "#333", ...this.props.textViewStyles}}>{this.state.statementEntry ? this.state.statementEntry: null} </div>
            
            {this.props.active ?
              <button
                style={{...this.btnStyleDefault, ...this.props.btnStyles}}
                onClick={()=>{this.setState({editMode: true});}}
                disabled={this.props.disabled}>
                  <FaPencilAlt style={{ margin: 10, width: 25, height: 25  }}/>
              </button>
            : null}
        </div>
      );
    }

    return null;
  }
}

export default BrevityStatementEntry;