const contractAddress = 'ct_2f2D7S9rB3p9db2KTAGBC1vuL9DBWWzANLLgwdQtSKCuGoq7HJ';
var client = null;
var paymentArray = [];
var paymentsLength = 0;


function renderMemes() {
  var paymentJs = $('#paymentJs').html();
  Mustache.parse(paymentJs);
  var rendered = Mustache.render(paymentJs, {paymentArray});
  $('#paymentList').html(rendered);
}

window.addEventListener('load', async () => {
  $('#loader').show();

  client = await Ae.Aepp();

  const calledGet = await client.contractCallStatic(contractAddress, 'sophia-address', 'getPaymentsLength', {args: '()'}).catch(e => console.error(e));
  console.log('calledGet', calledGet);
  const decodedGet = await client.contractDecodeData('int', calledGet.result.returnValue).catch(e => console.error(e));
  console.log('decodedGet', decodedGet.value);

  renderMemes();

  $('#loader').hide();
});

$('#registerBtn').click(async function(){
  var name = ($('#paymentName').val()),
      matric = ($('#paymentMatric').val()),
      paymentType = ($('#paymentType').val()),
      amount = ($('#paymentAmount').val());

  paymentArray.push({
    name: name,
    matric: matric,
    paymentType: paymentType,
    amount: amount,
    index: paymentArray.length + 1,
  })
  renderMemes();
});
