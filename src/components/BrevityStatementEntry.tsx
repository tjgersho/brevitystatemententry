import React from "react";
import { AudienceType, WordingOptimization, BSEProps  } from "./BrevityStatementEntry.types";

import aibnt from "./aibtn.png";
import loader from './loader.gif';

import {GrClose, GrSave} from 'react-icons/gr';
import { FaSpellCheck, FaChevronDown, FaChevronUp, FaPencilAlt, FaSave, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {getCompletions, getGrammer} from '../apis/openai';
import "./rotate.css"

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
  historyPointer: number,
  scrollLeft: boolean
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
     historyPointer: -1,
     scrollLeft: true
   };


   static defaultProps = {
      label: "Enter a single pitch statement.",
      placeholder: "Write your statement here.",
      apiBase: "http://localhost:8000",
      activateAI: false,
      doGrammer: false,
      active: true,
      showSave: false,
      doSuggestionList: false,
      editMode: false
   };

   private textRef: React.RefObject<HTMLTextAreaElement> = React.createRef<HTMLTextAreaElement>();
 

   public componentDidMount(){
    if(this.textRef.current){
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
  }
  
  private getRandomSuccinctSynonym(){
    var synonymList = ["succinct", "blunt", "terse", "compact", "short"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }

  private getRandomClaritytSynonym(){
    var synonymList = ["accurate", "certain", "positive", "trustworthy", "clear"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }

  private getRandomAspirationSynonym(){
    var synonymList = ["dreamy", "aspirational", "eager", "longing", "passionate"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }

  private getRandomCompellingSynonym(){
    var synonymList = ["facinating", "coersive", "compulsory", "forcible", "compelling"];
    const randomIndex = Math.floor(Math.random() * synonymList.length);
    return synonymList[randomIndex];
  }
 
 

  private generatePrompt() : string{
      var prepend = "";

      if(this.props.optimizeBy != undefined){
        switch(this.props.optimizeBy){
          case WordingOptimization.Succinctness:
            prepend = "Write a persuasive statement that is extreamly " +this.getRandomSuccinctSynonym()+ " similar to: ";
            break;
          case WordingOptimization.Clarity:
            prepend = "Write a " +this.getRandomClaritytSynonym()+ " statement similar to: ";
            break;
          case WordingOptimization.Aspiration:
            prepend = "Write a very " +this.getRandomAspirationSynonym()+ " statement from the basis: ";
            break;
          case WordingOptimization.Grammar:
            prepend = "Correct this statement for grammer: ";
            break;
          case WordingOptimization.Compelling:
            prepend = "Write a " +this.getRandomCompellingSynonym()+ " statement similar to: ";
            break;
          default:
            prepend = "Write a persuasive pitch similar to: ";
        }

      }else{

        switch(this.props.audience){
          case AudienceType.Structure:
            prepend = "Write a persuasive pitch that is structured and to the point that is similar to: ";
            break;
          case AudienceType.Bold:
            prepend = "Write a persuasive pitch that is very bold and similar to: ";
            break;
          case AudienceType.Caring:
            prepend = "Write a persuasive pitch that sounds very caring similar to: ";
            break;
          case AudienceType.Intellect:
            prepend = "Write a persuasive pitch that sounds very intellectual similar to: ";
            break;
  
          default:
            prepend = "Write a persuasive pitch similar to: ";
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

        if(newHistory.length == 0){
          newHistory.push(this.state.statementEntry);
        }
        
        newHistory.push(text);
        console.log("NEw History???");
        console.log(newHistory);

        this.setState({
          suggestions:  addsuggestions, 
          loading: false, 
          sort: nextSort, 
          statementEntry: text, 
          history: newHistory, 
          historyPointer: newHistory.length-1,
          scrollLeft: true
        });
        
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
    if(this.state.scrollLeft){
      var newHistoryPointer = this.state.historyPointer-1;

      console.log(newHistoryPointer      );
      console.log(this.state.history);
      if(newHistoryPointer>0){
        this.setState({statementEntry: this.state.history[newHistoryPointer], historyPointer: newHistoryPointer});
      } else{
        this.setState({statementEntry: this.state.history[0], historyPointer: 0, scrollLeft: false});
      }
    }else{
      var newHistoryPointer = this.state.historyPointer+1;
      console.log(newHistoryPointer      );
      console.log(this.state.history);
      if(newHistoryPointer < this.state.history.length){
        this.setState({statementEntry: this.state.history[newHistoryPointer], historyPointer: newHistoryPointer});
      }else{
        this.setState({statementEntry: this.state.history[this.state.history.length-1], historyPointer: this.state.history.length-1, scrollLeft: true});
      }
    }
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
                  display: 'flex',
                  flexDirection: 'row'
                  }}
                  >
              
              <textarea
                ref={this.textRef}
                onChange={(e)=>{this.onStatementChange(e); if(this.props.onChange){ this.props.onChange(e);}}}
                onBlur={(e)=>{if(this.props.onBlur){ this.props.onBlur(e);}}}
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

              <div style={{display: 'flex', flexDirection: 'column', margin: 5, justifyContent: 'space-around'}}> 
             
                {this.props.active ?
                  <button style={{ border: 'none', cursor:'pointer',  background: 'transparent', padding: 5,  borderRadius: 10,  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",}} onClick={()=>{this.callLanguageModel();}} disabled={!this.props.apiBase}>
                    <img src={aibnt} style={{width: 30, height: 30, opacity: this.props.apiBase? 1.0 : 0.25 }}/>
                  </button>
                : null}
       
                {this.props.showSave? 
                  <button 
                    style={{border: 'none', cursor:'pointer',  background: 'transparent', padding: 0}} 
                    onClick={
                      ()=>{
                        if(this.props.onSave){
                          this.props.onSave(this.state.statementEntry); 
                        }
                        console.log("SAVE>>");
                        this.setState({editMode: false})
                      }} 
                    disabled={!this.props.apiBase}>
                    <FaSave style={{width: 30, height: 30}}/>
                  </button>
                : null}

                 {(this.state.history.length > 0 || this.state.loading) && !this.props.doSuggestionList ?
                  <button 
                      style={{border: 'none', cursor:'pointer', background: '#fff',  borderRadius: 10, display: 'flex', alignItems: 'center', height: 35, boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}
                      onClick={()=>{this.scrollThruStatements()}} >
                        {this.state.loading ? 
                              <img src={loader} style={{width: 30, height: 30}}/>
                        : <React.Fragment>
                              {this.state.scrollLeft ? <FaChevronLeft style={{width: 30, height: 30}}/> :  <FaChevronRight style={{width: 30, height: 30}}/>}
                        </React.Fragment>
                        }
                  </button>
                :null}

              </div>

            </div>

           
              {this.props.doSuggestionList ?
              <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{justifyContent: 'center', display: Object.keys(this.state.suggestions).length > 0  || this.state.loading ? 'flex': 'none'}}>
                      <button 
                        style={{border: 'none', cursor:'pointer', background: '#fff',  borderRadius: 10, display: 'flex', alignItems: 'center', height: 35, boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", marginTop: -20 }}
                        onClick={()=>{this.setState({showHideSuggestions: !this.state.showHideSuggestions})}} >
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
                                  <button style={{border: 'none', cursor:'pointer', background: 'transparent', padding: 0, fontSize: 30}} onClick={()=>{this.removeSuggestion(s.id)}}><GrClose /></button>

                                  <button style={{border: 'none', cursor:'pointer',  background: 'transparent', padding: 0, fontSize: 30, marginTop: 30}} onClick={()=>{this.useSuggestion(s.id)}}><GrSave className="rotateimg180"/></button>
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
      
            <div style={{flexGrow: 1, color: this.props.active ? this.getOptimizeByColor() : "#333", ...this.props.textViewStyles}}>{this.state.statementEntry ? this.state.statementEntry: null} </div>
            
            {this.props.active ?
              <button
               style={{ border: 'none', cursor:'pointer',  background: 'transparent', padding: 0, margin: 5}}
                onClick={()=>{this.setState({editMode: true});}}
                 disabled={!this.props.apiBase}>
                  <FaPencilAlt style={{width: 30, height: 30}}/>
              </button>
            : null}
        </div>
      );
    }

    return null;
  }
}

export default BrevityStatementEntry;