let paymentArray = [];

let client = null, contractInstance = null;
const contractAddress = 'ct_2C7qjNqw634pMGpyuLkN4Lf8ZtUVRMssh9Uiq5tLEctgmD65dB';

const contractSource = `
payable contract EKSUPayment =

record payment =
  { studentAddress : address,
    name           : string,
    matric         : int,
    payType        : string,
    amount         : int }

record state =
  { payments       : map(address, list(payment)),
    schoolAddress  : address }

entrypoint init() =
  { payments = {},
    schoolAddress = ak_rLoCtHE3NK9dKyCNonJFYWkEEfeAsDUWa887GsCKqV1rhSuT6 }

payable stateful entrypoint makePayment(name' : string, matric' : int, payType' : string, amount' : int) =
  let payment = {studentAddress = Call.caller, name = name', matric = matric', payType = payType', amount = amount'}
  Chain.spend(state.schoolAddress, Call.value)

  let paymentList = Map.lookup_default(Call.caller, state.payments, [])
  let newPaymentList = payment::paymentList

  put(state{payments[Call.caller] = newPaymentList})

entrypoint userPayment() =
  state.payments[Call.caller]  

entrypoint getPayment() =
  state.payments
`;

function renderPayments() {
  let paymentJs = $('#paymentJs').html();
  Mustache.parse(paymentJs);
  let rendered = Mustache.render(paymentJs, {paymentArray});
  $('#paymentList').html(rendered);
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();
  contractInstance = await client.getContractInstamce(contractSource,{contractAddress});

  let allPayments=(await contractInstance.methods.getPayment()).decodedResult;
  allPayments=map(payment=>{
    paymentArray.push({
      name: payment.name,
      matric: payment.matric,
      payType: payment.payType,
      amount: payment.amount,
    })
  });

  renderPayments();

  $("#loader").hide();
});

$('#registerBtn').click(async function(){
  $("#loader").show();

  const name = ($('#paymentName').val()),
        matric = ($('#paymentMatric').val()),
        payType = ($('#payType').val()),
        amount = ($('#paymentAmount').val()),
        cryptoAmount = amount * 1000000000000000000;

  await contractInstance.methods.makePayment(name, matric, payType, amount,{cryptoAmount});

  paymentArray.push({
    name: name,
    matric: matric,
    payType: payType,
    amount: amount,
  })

  renderPayments();
  $("#loader").hide();
})
