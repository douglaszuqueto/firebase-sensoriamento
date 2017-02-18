(function () {

  const currentPresence = document.getElementById('currentPresence');
  const currentLamp     = document.getElementById('currentLamp');
  const btnLamp         = document.getElementById('btn-lamp');

  let currentLampValue = false;


  // Inicia o firebase Firebase
  let config = {
    apiKey           : 'AIzaSyBX3XR39UOcd4RpsXKSSHSPFRspoPPx_jA',
    authDomain       : 'douglaszuqueto-iotbr.firebaseapp.com',
    databaseURL      : 'https://douglaszuqueto-iotbr.firebaseio.com',
    storageBucket    : 'douglaszuqueto-iotbr.appspot.com',
    messagingSenderId: '50701734860'
  };

  firebase.initializeApp(config);

  const db = firebase.database();

  // Cria os listeners dos dados no firebase
  const tempRef     = db.ref('temperature');
  const umidRef     = db.ref('humidity');
  const presenceRef = db.ref('presence');
  const lampRef     = db.ref('lamp');

  // Retorna uma função que de acordo com as mudanças dos dados
  // Atualiza o valor atual do elemento, com a metrica passada (currentValueEl e metric)
  // e monta o gráfico com os dados e descrição do tipo de dados (chartEl, label)
  const onNewData = (currentValueEl, chartEl, label, metric) => {
    return (snapshot) => {
      let readings = snapshot.val();
      if ( !readings ) {
        return;
      }

      let currentValue;
      let data = [];
      for ( let key in readings ) {
        if ( !readings.hasOwnProperty(key) ) {
          return;
        }
        currentValue = readings[key];
        data.push(currentValue);
      }

      document.getElementById(currentValueEl).innerText = `${currentValue} ${metric}`;
      buildLineChart(chartEl, label, data);
    };
  };

  // Constroi um gráfico de linha no elemento (el) com a descrição (label) e os
  // dados passados (data)
  const buildLineChart = (el, label, data) => {
    let elNode = document.getElementById(el);
    new Chart(elNode, {
      type: 'line',
      data: {
        labels  : new Array(data.length).fill(''),
        datasets: [{
          label          : label,
          data           : data,
          borderWidth    : 1,
          fill           : false,
          spanGaps       : false,
          lineTension    : 0.1,
          backgroundColor: "#F9A825",
          borderColor    : "#F9A825"
        }]
      }
    });
  };

  // Registra as funções que atualizam os gráficos e dados atuais da telemetria
  tempRef.on('value', onNewData('currentTemp', 'tempLineChart', 'Temperatura', 'C°'));
  umidRef.on('value', onNewData('currentUmid', 'umidLineChart', 'Umidade', '%'));

  // Registrar função ao alterar valor de presença
  presenceRef.on('value', (snapshot) => {
    if ( !snapshot.val() ) {
      currentPresence.classList.remove('green-text');
      return;
    }
    currentPresence.classList.add('green-text');

  });

  // Registrar função ao alterar valor da lampada
  lampRef.on('value', (snapshot) => {
    let value        = snapshot.val();
    currentLampValue = !!value;

    if ( !value ) {
      currentLamp.classList.remove('amber-text');
      return;
    }
    currentLamp.classList.add('amber-text');
  });

  // Registrar função de click no botão de lampada
  btnLamp.addEventListener('click', (evt) => {
    lampRef.set(!currentLampValue);
  });

})();
