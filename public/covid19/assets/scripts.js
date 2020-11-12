const DEVELOP_BASE_URL = 'http://localhost:3000/api/'
//Shanna@melissa.tv

$('.login_form').submit(async(e)=>{
  e.preventDefault()
  const email = $('#email').val()
  const password = $('#password').val()
  const token = await getToken(email,password)
  const total = await getResource('total', token)
  
  $("#loginform").modal("toggle")
  $("#mostrarLinks").show()
  $("#iniciar").hide()
  crearGraficoPrincipal(total)
  llenarTabla(total, "js-table-posts")
})
async function getToken(email, password){
  try{
    const response =  await fetch(`${DEVELOP_BASE_URL}login`,{
      method: 'POST',
      body: JSON.stringify( { email: email, password: password } )
    })
    const { token } = await response.json()
    localStorage.setItem('jwt-token',token)
    return token;
  } catch(err){
    console.log(err);
  }
}

$('#cerrar').on('click', function(){
  localStorage.clear()
  location.reload()
})

$('#situacionChile').on('click', async function(){
  const token2 = localStorage.getItem('jwt-token');
  const total = await getChile(token2, "containerGraficoChile")
  crearGraficoChile(total)
  $('#containerGrafico').hide()
  $('#js-table-posts').hide()
  $('#containerTabla').hide()
})


async function getChile(token){
  try{
    const confirmed = await fetch(`${DEVELOP_BASE_URL}confirmed`,{
      method:'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const deaths = await fetch(`${DEVELOP_BASE_URL}deaths`,{
      method:'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const recovered = await fetch(`${DEVELOP_BASE_URL}recovered`,{
      method:'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data_total = {
      confirmed_data : await confirmed.json(),
      deaths_data : await deaths.json(),
      recovered_data : await recovered.json()
  }
    return (data_total)
  } catch(err) {
    console.log(err);
  }
}

function crearGraficoChile(data_total) {
  console.log(data_total)

  var dataConfirmados = data_total.confirmed_data.data.map(function (info){
      return{ label: info.date, y: info.total}
  })
  var dataMuertos = data_total.deaths_data.data.map(function (info){
      return{ label: info.date, y: info.total}
  })
  var dataRecuperados = data_total.recovered_data.data.map(function (info){
      return{ label: info.date, y: info.total}
  })
  var chart = new CanvasJS.Chart("chartContainerChile", {
      exportEnabled: false,
      animationEnabled: true,
      title:{
          text: "Situación Chile"
      },
      subtitles: [{
          text: ""
      }], 
      axisX: {
          title: "",
          labelAngle: 90,
      },
      axisY: {
          includeZero: true
      },
      toolTip: {
          shared: true
      },
      legend: {
          cursor: "pointer",
      },
      data: [
      {
          type: "line",
          name: "Casos Confirmados",
          showInLegend: true,
          yValueFormatString: "#,##0.# Casos",
          dataPoints: dataConfirmados
      },
      {
          type: "line",
          name: "Muertes",
          showInLegend: true,
          yValueFormatString: "#,##0.# Personas",
          dataPoints: dataMuertos
      },
      {
          type: "line",
          name: "Recuperados",
          showInLegend: true,
          yValueFormatString: "#,##0.# Personas",
          dataPoints: dataRecuperados
      }]
  });

  $("#containerGraficoChile").attr("style", "margin-top:35%;"); 

  chart.render();
}

async function getResource(resource, token){
  try{
    const response = await fetch(`${DEVELOP_BASE_URL}${resource}`,{
      method:'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const { data } = await response.json()

    return (data)
  } catch(err) {
    console.log(err);
  }
}

function llenarTabla(total, tabla){
  let tableContent = ''
  
  total.forEach(function (dato, indice) {

    tableContent += `<tr>
      <td>${dato.location}</td>
      <td>${dato.active}</td>
      <td>${dato.confirmed} </td>
      <td>${dato.deaths} </td>
      <td>${dato.recovered} </td>
      <td>
        <button meta-id="${indice}" meta-country="${dato.location}" class="modelo">Ver detalles</button>
      </td>
    </tr>`;
  });
  $(`#${tabla} tbody`).append(tableContent);
}

function crearGraficoPrincipal(data) {
  data = data.filter(function (elemento) {return elemento.active >= 10000})
  data.sort(((a, b) => b.active - a.active))

  var dataActivos = data.map(function (info){
          return{ label: info.location, y: info.active}
  })
  var dataConfirmados = data.map(function (info){
      return{ label: info.location, y: info.confirmed}
  })
  var dataMuertos = data.map(function (info){
      return{ label: info.location, y: info.deaths}
  })
  var dataRecuperados = data.map(function (info){
      return{ label: info.location, y: info.recovered}
  })
  var chart = new CanvasJS.Chart("chartContainer", {
      exportEnabled: false,
      animationEnabled: true,
      title:{
          text: "Casos a nivel mundial"
      },
      subtitles: [{
          text: ""
      }], 
      axisX: {
          title: "",
          labelAngle: 90,
      },
      axisY: {
          includeZero: true
      },
      toolTip: {
          shared: true
      },
      legend: {
          cursor: "pointer",
      },
      data: [{
          type: "column",
          name: "Casos Activos",
          showInLegend: true,      
          yValueFormatString: "#,##0.# Casos",
          dataPoints:dataActivos
      },
      {
          type: "column",
          name: "Casos Confirmados",
          showInLegend: true,
          yValueFormatString: "#,##0.# Casos",
          dataPoints: dataConfirmados
  },
      {
          type: "column",
          name: "Muertes",
          showInLegend: true,
          yValueFormatString: "#,##0.# Personas",
          dataPoints: dataMuertos
      },
      {
          type: "column",
          name: "Recuperados",
          showInLegend: true,
          yValueFormatString: "#,##0.# Personas",
          dataPoints: dataRecuperados
      }]
  });

  $("#containerGrafico").attr("style", "margin-top:35%;"); 

  chart.render();
}

  const table = document.querySelector('table#js-table-posts')
  table.addEventListener('click', function mostrarDetalle(e){
    e.preventDefault()
    console.log(mostrarDetalle)
  const countryTarget = e.target.dataset.dato 
  if(countryTarget){
    const dataCountry = total.find(dato => dato.location === countryTarget)
    showModal(dataCountry)
  }
  function showModal(dato){
    const modalTitle = document.querySelector('.modal-title')
    modalTitle.innerText = dato.location
    fillChart(dato, 'modalChart')
    $('.modal').modal('show')
  }
  
  function fillChart(data, canvas){
    const ctx = document.getElementById(canvas).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Confirmados', 'Fallecidos', 'Recuperados', 'Activos'],
        datasets: [{
            label: '# of Votes',
            data: [data.confirmed, data.deaths, data.recovered, data.active],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
         }
      }
    });
  }
  })