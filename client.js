const listagem = document.getElementById('listagem');
const titulo = document.getElementById('title');
const mensagem = document.getElementById('msg');
const autor = document.getElementById('author');
const usuario = document.getElementById("user");
const senha = document.getElementById("passwd");
const busca_msgs = document.getElementById('buscando-mensagens');

let actual_view = "home";

let mensagens = [];
function get_messages() {
	fetch('http://150.165.85.16:9900/api/msgs')
	.then(r => r.json())
	.then(data => {
		Object.assign(mensagens, data);
		mensagens.sort(function(a,b) {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
	});
}

function update_view(update_mensagens) {
	const itens = update_mensagens.map(function (e) {
		var corpo_msg = `
		<div id="msg-content-div">
			<h2 id="titulo-mensagem">${e.title}</h2>
			<h3 id="corpo-mensagem">${e.msg}</h3>
			<small id="autor-mensagem">
				<p>Enviado por: <b>${e.author}</b></p>
			</small>
			<small id="data-hora-mensagem">
				<p>Em ${new Date(e.created_at).toLocaleDateString()} às ${new Date(e.created_at).toLocaleTimeString("pt-BR")}</p>
			</small>`;

		if (e.frontend === usuario.value) {
			corpo_msg += `<button id="delete-msg" onclick="deletar_mensagens('${e.id}')">X</button>`
		};

		corpo_msg += `</div>`;
		return corpo_msg;
	}
		);

		
	listagem.innerHTML = itens.join("\n");
}

function enviarmsg() {
	const dados = {
		title:titulo.value, 
        msg:mensagem.value, 
        author:autor.value, 
		credentials:`${usuario.value}:${senha.value}`
	};
	const corpo = JSON.stringify(dados);
	fetch('http://150.165.85.16:9900/api/msgs', { method: 'POST', body: corpo});
	get_messages();
	if (actual_view === "suas-mensagens") {
		suas_mensagens();
	}
	else {
		update_view(mensagens);
	}
	titulo.value = "";
	mensagem.value = "";
	autor.value = "";
}

function buscar_mensagens() {
	get_messages();
	const value = busca_msgs.value;
	mensagens = mensagens.filter(e => 
		e.title.includes(value) || e.author.includes(value) ||
		e.msg.includes(value)
		)
	update_view(mensagens);
	actual_view = "busca";

}

function deletar_mensagens(id) {
	const corpo = JSON.stringify({credentials:`${usuario.value}:${senha.value}`});
	console.log("deletando " + id)
    fetch(`http://150.165.85.16:9900/api/msgs/${id}`, {method:'DELETE', body: corpo})
    .then(function () {
		suas_mensagens();
	});
	get_messages();
	if (actual_view === "suas-mensagens") {
		suas_mensagens();
	}
	else {
		update_view(mensagens);
	}
}

function suas_mensagens() {
	let find = mensagens.filter(e => e.frontend === usuario.value)
	update_view(find);
	actual_view = "suas-mensagens";
}

fetch('http://150.165.85.16:9900/api/msgs')
	.then(r => r.json())
	.then(data => {
		Object.assign(mensagens, data);
		mensagens.sort(function(a,b) {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
		update_view(mensagens);
	});
