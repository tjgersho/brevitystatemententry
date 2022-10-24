
 
export async function getCompletions(apiBase: string, prompt: string, audience: number = 0, optimizeBy: number = 0): Promise<any>{
    try{
       var resp =  await fetch(apiBase + "/openai/completion", {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({prompt, optimizeBy, audience}),
            method: "POST"
          });
 
          var jsonResp = resp.json();
 
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
 
        var jsonResp = resp.json();
  
      return  jsonResp;
  }catch(ex){
      return "FAILED CALL";
  }
}