const $ = document.querySelector.bind(document)

const listaDeCidades = $('.tela-de-pesquisa ul')
const preloader      = $('#preloader')
const proximasHoras  = $('.proximas-horas ul')
const elmCidade      = $('.cidade span')
const elmTemperatura = $('.temperatura')
const elmIcone       = $('.descricao .icone')
const elmDescricao   = $('.descricao span')
const elmMinima      = $('.variacao .minima')
const elmMaxima      = $('.variacao .maxima')
const preloaderTempo = $('.carregamento')
const btnVoltar      = $('#voltar')

const diasDaSemana = [ "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

const api = {
     url : 'https://api.openweathermap.org/data/2.5/weather',
     key : '97ece94bd03d84b8ea2e2dcbcbcce566'
}


var requisicao = async ( url)=>
{
 url = encodeURI( url )
 
  const promisse = await fetch(url).then( e => e.json() ).catch((erro)=>  alert('⚠️'+erro))
  return promisse
}

function obterGeoLocalizacao(){
    if(!navigator.geolocation){
       alert('⚠️ Seu navegador não suporta a geolocalização')
    }else{
        navigator.geolocation.getCurrentPosition(sucesso, erro)
    }
    
    function sucesso( position ){
      let {latitude, longitude} = position.coords
      
      obterDadosMetereologicos({
         lat : latitude,
         lon : longitude
      })
      
    }
    
    function erro(){
      alert('⚠️ Não foi possível obter sua geolocalização.\n\nClique na lupa para pesquisar.')
    }
}


function pesquisarLocal( nome )
{
  listaDeCidades.innerHTML = ``
  preloader.style.setProperty('display','flex')
  
   const url = `https://api.openweathermap.org/geo/1.0/direct?q=${nome || ' '}&limit=40&appid=${api.key}&lang=pt`
    
    requisicao(url).then(( dados )=>{
     
        dados = dados.map( dados => dados)
        var {lat,lon} = dados
        criarLista( dados )
        
    }).catch(( erro )=>{
       preloader.style.setProperty('display','none')
       throw erro + ' :('
    })
}


function criarLista( itens = [])
{
 
 preloader.style.setProperty('display','none')
 
 listaDeCidades.innerHTML = ''
 
 itens?.forEach(( cidade )=>{
       const {name:nome, state:estado, country: pais} = cidade
       
       const novoItem         = document.createElement('li')
             novoItem.onclick = ()=> obterDadosMetereologicos(cidade)
             listaDeCidades.appendChild( novoItem)
             novoItem.innerHTML = `${nome}, ${estado}, ${pais}`
         })
}

function obterDadosMetereologicos( cidade )
{
 preloaderTempo.classList.add('mostrar')
 
   const url = `${api.url}?lat=${cidade.lat}&lon=${cidade.lon}&appid=${api.key}&units=metric&lang=pt`
 
       const dados = requisicao(url)
             dados.then(( d )=>{
                    
 
 
              preloaderTempo.classList.remove('mostrar')
 
                const { main } = d
                const { temp, temp_min, temp_max } = main
                
          elmCidade.innerText      = cidade.name || d.name
          elmDescricao.innerText   = d.weather[0].description
          elmIcone.src             = `assets/img/icons/${d.weather[0].icon}@2x.png`
          elmTemperatura.innerText = Math.round(temp)
          elmMinima.innerText      = 'Min '+ Math.round(temp_min) + '° |'
          elmMaxima.innerText      = 'Max '+Math.round(temp_max) + '°'
          
          previsaoDosProximosDias( cidade )
 
    })
         $('.tela-de-pesquisa').style.setProperty('display','none')
         
         salvarDados('dados-metereologicos', cidade)
}


function previsaoDosProximosDias( obj = {} )
{
 const { lat,lon } = obj
 const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api.key}&units=metric&lang=pt`
 
  requisicao( url )
      .then(( obj )=>{
        
          for( let i of obj.list)
          {
           const dta = i.dt_txt.split(' ')
           const data = dta[0].split('-')
           const data2 = dta[1].split(':')
           const horas = data2[0]
           const minutos = data2[1]
           const dia = data[2]
           const mes = data[1] - 1
           const ano = data[0]
           
           const newDate = new Date(ano, mes, dia)
           
           const diaDaSemana = diasDaSemana[ newDate.getDay() ]
           
           const main  = i.main
           $('.proximas-previsoes ul').innerHTML += `
              <li>
                 <h3 class="titulo">${ diaDaSemana}<br>${horas}:${minutos}</h3>
                 <img src="assets/img/icons/${i.weather[0].icon}@2x.png" alt="">
                 <div class="temperaturas">
                      <span class="min">${Math.round(main.temp_min)}° | </span>
                      <span class="max">${Math.round(main.temp_max)}°</span>
                 </div>`
             
                     }
                  })
                  
   salvarDados('dados-metereologicos-proximos-dias', obj)
}


function salvarDados(chave, dados){
  let json = JSON.stringify(dados)
      return localStorage.setItem(chave, json)
}

function carregarDados(chave){
  let dados = localStorage.getItem(chave)
  let conversao  = JSON.parse(dados)
      return conversao
}


$('#pesquisar').onclick = ()=>{
     $('.tela-de-pesquisa').style.setProperty('display','flex')
          $('#pesquisa').onkeyup = (e)=>{
              pesquisarLocal( e.target.value)
  }
}

btnVoltar.onclick = ()=>{
     $('.tela-de-pesquisa').style.setProperty('display','none')
}

window.addEventListener('DOMContentLoaded',()=>{
     obterGeoLocalizacao()
     
     let dadosDaCidade = carregarDados('dados-metereologicos')
     let dadosDaCidadeProximosDias = carregarDados('dados-metereologicos-proximos-dias')
     if(dadosDaCidade && dadosDaCidadeProximosDias)
     {
     obterDadosMetereologicos(dadosDaCidade)
     previsaoDosProximosDias(dadosDaCidadeProximosDias)
     }
     
     setTimeout(()=>{
       let telaDeAbertura = document.querySelector('.abertura')
           telaDeAbertura.remove()
    }, 2000)

})

