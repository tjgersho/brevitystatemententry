
 
export async function getCompletions(apiBase: string, prompt: string): Promise<any>{
    try{
       

       var resp =  await fetch(apiBase + "/openai/completion", {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({prompt: prompt}),
            method: "POST"
          });

          console.log('OpenAI Call...');
          var jsonResp = resp.json();
          console.log(jsonResp);
          
        return  jsonResp;
    }catch(ex){
        return "FAILED CALL";
    }
}


export async function getGrammer(apiBase: string, statement: string): Promise<any>{
  try{
     var resp =  await fetch(apiBase + "/openai/grammer", {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({statement: statement}),
          method: "POST"
        });

        console.log('OpenAI Call...');
        var jsonResp = resp.json();
        console.log(jsonResp);
        
      return  jsonResp;
  }catch(ex){
      return "FAILED CALL";
  }
}