const listagem = document.getElementById('listagem');
const titulo = document.getElementById('title');
const mensagem = document.getElementById('msg');
const autor = document.getElementById('author');
const busca_msgs = document.getElementById('buscando-mensagens');

let mensagens = [];
function get_messages() {
	fetch('http://150.165.85.16:9900/api/msgs')
	.then(r => r.json())
	.then(data => {
		Object.assign(mensagens, data);
		update_view(mensagens);
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

		if (e.frontend === "gsilva") {
			corpo_msg += `<button id="delete-msg" onclick="deletar_mensagens('${e.id}')">X</button>`
		};

		corpo_msg += `</div>`;
		return corpo_msg;
	}
		);

		
	listagem.innerHTML = itens.reverse().join("\n");
}

function enviarmsg() {
	const dados = {
		title:titulo.value, 
        msg:mensagem.value, 
        author:autor.value, 
        credentials:"gsilva:geoprofsw"
	};
	const corpo = JSON.stringify(dados);
	fetch('http://150.165.85.16:9900/api/msgs', { method: 'POST', body: corpo});
	get_messages();
	titulo.value = "";
	mensagem.value = "";
	autor.value = "";
}

function buscar_mensagens() {
	const value = busca_msgs.value;
	let find = mensagens.filter(e => 
		e.title.includes(value) || e.author.includes(value) ||
		e.msg.includes(value)
		)
	update_view(find);

}

function deletar_mensagens(id) {
	const corpo = JSON.stringify({credentials: "gsilva:geoprofsw"});
	console.log("deletando " + id)
    fetch(`http://150.165.85.16:9900/api/msgs/${id}`, {method:'DELETE', body: corpo})
    .then(function () {
		suas_mensagens();
	});
}

function suas_mensagens() {
	let find = mensagens.filter(e => e.frontend === "gsilva")
	update_view(find);
}

get_messages();



