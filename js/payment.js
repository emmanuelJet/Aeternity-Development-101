const contractAddress = 'ct_2f2D7S9rB3p9db2KTAGBC1vuL9DBWWzANLLgwdQtSKCuGoq7HJ';
var client = null;
var paymentArray = [];
var paymentsLength = 0;


function renderPayments() {
  var paymentJs = $('#paymentJs').html();
  Mustache.parse(paymentJs);
  var rendered = Mustache.render(paymentJs, {paymentArray});
  $('#paymentList').html(rendered);
}

async function callStatic(func, args, types) {
  const calledGet = await client.contractCallStatic(contractAddress,
  'sophia-address', func, {args}).catch(e => console.error(e));

  const decodedGet = await client.contractDecodeData(types,
  calledGet.result.returnValue).catch(e => console.error(e));

  return decodedGet;
}

async function contractCall(func, args, value, types) {
  const calledSet = await client.contractCall(contractAddress, 'sophia-address',
  contractAddress, func, {args, options: {amount:value}}).catch(async e => {
    const decodedError = await client.contractDecodeData(types,
    e.returnValue).catch(e => console.error(e));
  });

  return
}

window.addEventListener('load', async () => {
  $('#loader').show();

  client = await Ae.Aepp();

  const getPaymentsLength = await callStatic('getPaymentsLength','()','int');
  paymentsLength = getPaymentsLength.value;

  for (let i = 1; i <= paymentsLength; i++) {
    const payment = await callStatic('getPayment',`(${i})`,'(address, address, string, int, string, int)');

    paymentArray.push({
      name: payment.value[2].value,
      matric: payment.value[3].value,
      payType: payment.value[4].value,
      amount: payment.value[5].value,
      index: i,
    })
  }

  renderPayments();

  $('#loader').hide();
});

$('#registerBtn').click(async function(){
  const name = ($('#paymentName').val()),
      matric = ($('#paymentMatric').val()),
      paymentType = ($('#paymentType').val()),
      amount = ($('#paymentAmount').val());

  await contractCall('makePayment',`("${name}","${matric}","${paymentType}","${amount}")`,`("${amount}")`,'(int)');

  paymentArray.push({
    name: name,
    matric: matric,
    paymentType: paymentType,
    amount: amount,
    index: paymentArray.length + 1,
  })
  renderPayments();
});
