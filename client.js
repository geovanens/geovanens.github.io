const listagem = document.getElementById('listagem-mensagens');
const titulo = document.getElementById('titulo');
const mensagem = document.getElementById('mensagem');
const autor = document.getElementById('autor');
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
const campo_busca = document.getElementById('campo-busca');

var view_atual = 'todas_msgs';

let mensagens = [];

function atualiza_mensagens() {
	fetch('http://150.165.85.16:9900/api/msgs')
	.then(r => r.json())
	.then(data => {
		Object.assign(mensagens, data);
		mensagens.sort(function(a,b) {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
		if (view_atual === "todas_msgs") {
			atualiza_listagem();
		}
		else if (view_atual === "suas_msgs" ) {
			atualiza_listagem(mensagens.filter(e => e.frontend === usuario.value));
		}
		else {
			buscar_mensagens();
		}
	});
}

function atualiza_listagem(update_mensagens=mensagens) {
	const itens = update_mensagens.map(function (e) {
		var corpo_msg = `
		<div id="cartao-mensagem">
			<h4 id="titulo-mensagem">${e.title}</h4>
			<h5 id="corpo-mensagem">${e.msg}</h5>
			<small id="autor-mensagem">
				<p>Enviado por: <b>${e.author}</b></p>
			</small>
			<small id="data-hora-mensagem">
				<p>Em ${new Date(e.created_at).toLocaleDateString()} às ${new Date(e.created_at).toLocaleTimeString("pt-BR")}</p>
			</small>`;

		if (e.frontend === usuario.value) {
			corpo_msg += `<button id="botao-apaga-msg" onclick="deletar_mensagens('${e.id}')" style=
			"border: none; text-decoration: none; border: 0; background: transparent; margin-left:45%">
			<img src="images/delete.png"/>
			</button>`
		};

		corpo_msg += `</div>`;
		return corpo_msg;
	}
		);	
	listagem.innerHTML = itens.join("\n");
}

function confirma_login () {
	if (usuario.value != "" && senha.value != "") {
		const credenciais = `${usuario.value}:${senha.value}`;
		const stat = document.getElementById("status-login");
		const dados = {
			title:".", 
			msg:".", 
			author:".", 
			credentials:credenciais
		};
		const corpo = JSON.stringify(dados);
		var resposta = null;
		fetch('http://150.165.85.16:9900/api/msgs', { method: 'POST', body: corpo}).then(
			function (response) { resposta = response; return response.json()}).then(function (dados) {
				if (resposta.status == 200) {
					usuario.disabled=true;
					senha.disabled=true;
					stat.hidden = true;
					const corpo_delete = JSON.stringify({credentials:credenciais});
					fetch(dados.url, {method:'DELETE', body: corpo_delete})
					new Promise((resolve) => setTimeout(resolve, 500)).then(() => 
					atualiza_mensagens());
				}
				else {
					var erro = dados.message;
					if (dados.message === "secret inválido") {
						erro = "senha inválida";
					}
					else if (dados.message === "frontend_id não reconhecido") {
						erro = "usuario não cadastrado";
					}
					stat.innerHTML = `<small style="color: red">${erro}</small>`;
					stat.hidden = false;
				}
			});
	}
	
}

function enviar_msg() {
	if (!usuario.disabled) {
		const stat = document.getElementById('status-login');
		stat.innerHTML = `<small style="color: red">Você precisa fazer login</small>`;
		stat.hidden = false;
	}
	else {
		const dados = {
			title:titulo.value, 
			msg:mensagem.value, 
			author:autor.value, 
			credentials:`${usuario.value}:${senha.value}`
		};
		const corpo = JSON.stringify(dados);
		fetch('http://150.165.85.16:9900/api/msgs', { method: 'POST', body: corpo});
		atualiza_mensagens();
		titulo.value = "";
		mensagem.value = "";
		autor.value = "";
	}
}

function gerenciador_views () {
	if (document.getElementById("view-mensagens").value === "0") {
		view_atual = "todas_msgs";
		atualiza_mensagens();
	}
	else {
		view_atual = "suas_msgs";
		atualiza_mensagens();
	}
}

function buscar_mensagens() {
	const value = campo_busca.value;
	const filtradas = mensagens.filter(e => 
		e.title.includes(value) || e.author.includes(value) ||
		e.msg.includes(value)
		)
	view_atual = "busca";
	atualiza_listagem(filtradas);

}

function deletar_mensagens(id) {
	const corpo = JSON.stringify({credentials:`${usuario.value}:${senha.value}`});
    fetch(`http://150.165.85.16:9900/api/msgs/${id}`, {method:'DELETE', body: corpo})
    .then(function () {
		atualiza_mensagens();
	});
}

function pressEnter () {
	if (window.event.keyCode == 13){   
		console.log("buscando " + campo_busca.value );
		buscar_mensagens();
  	}
}

fetch('http://150.165.85.16:9900/api/msgs')
	.then(r => r.json())
	.then(data => {
		Object.assign(mensagens, data);
		mensagens.sort(function(a,b) {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
		atualiza_listagem(mensagens);
});
