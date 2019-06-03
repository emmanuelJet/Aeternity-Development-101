const contractSource = `
  contract EksuPayment =

    record payment =
      { studentAddress : address,
        schoolAddress  : address,
        name           : string,
        matric         : int,
        payType        : string,
        amount         : int }
    
    record state =
      { payments      : map(int, payment),
        paymentsLength : int }
    
    function init() =
      { payments = {},
        paymentsLength = 0 }
    
    public function getPaymentsLength() : int =
      state.paymentsLength
    
    public stateful function makePayment(name' : string, matric' : int, payType' : string, amount' : int) =
      let payment = { studentAddress = Call.caller, schoolAddress = Call.origin, name = name', matric = matric', payType = payType', amount = amount'}
      let index = getPaymentsLength() + 1
      Chain.spend(payment.schoolAddress, Call.value)
      put(state{ payments[index] = payment, paymentsLength = index })
    
    public function getPayments(index : int) : payment =
      switch(Map.lookup(index, state.payments))
        None    => abort("There was no payment with this index registered.")
        Some(x) => x
`;

const contractAddress = 'ct_AaLYRT3jtvLJ1cksFvaRsdPVYdfvK61DiWQ1eXpwutRwvpATW';
var client = null;
var paymentArray = [];
var paymentsLength = 0;

function renderPayments() {
  let paymentJs = $('#paymentJs').html();
  Mustache.parse(paymentJs);
  let rendered = Mustache.render(paymentJs, {paymentArray});
  $('#paymentList').html(rendered);
}

async function callStatic(func, args) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();

  paymentsLength = await callStatic('getPaymentsLength', []);

  for (let i = 1; i <= paymentsLength; i++) {
    const payment = await callStatic('getPayments', [i]);
    paymentArray.push({
      name: payment.name,
      matric: payment.matric,
      payType: payment.payType,
      amount: payment.amount,
      index: i,
    })
  }

  renderPayments();

  $("#loader").hide();
});

$('#registerBtn').click(async function(){
  $("#loader").show();

  const name = ($('#paymentName').val()),
        matric = ($('#paymentMatric').val()),
        payType = ($('#payType').val()),
        amount = ($('#paymentAmount').val());

  await contractCall('makePayment', [name, matric, payType, amount], amount);

  paymentArray.push({
    name: name,
    matric: matric,
    payType: payType,
    amount: amount,
    index: paymentArray.length + 1,
  })

  renderPayments();
  $("#loader").hide();
});
