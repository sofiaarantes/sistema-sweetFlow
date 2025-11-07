function login(){
    var usuario="admin";
    var senha="1234";


    var usuarioDigitado=document.getElementById("usuario").value;
    var senhaDigitada=document.getElementById("senha").value;
    
    if(senha==senhaDigitada && usuario==usuarioDigitado){
        alert("Login realizado com sucesso!✅");
    
    window.Location.href="#"// para rederencionar a pagina aopos o login
    }else{ 
        alert("Usuário ou senha incorreto!❌");

    }

}