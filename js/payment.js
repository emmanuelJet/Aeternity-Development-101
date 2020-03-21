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

function allPayments(name, matric, type, amount){
  let allPayments=document.getElementById("paymentList");

  let paymentList = document.createElement('tr');

  let nameText=document.createElement("td");
  nameText.innerText=name;

  let matricText=document.createElement("td");
  matricText.innerText=matric;
  
  let typeText=document.createElement("td");
  typeText.innerText=type;

  let amountText=document.createElement("td");
  amountText.innerHTML=amount + "æ";

  paymentList.appendChild(nameText);
  paymentList.appendChild(matricText);
  paymentList.appendChild(typeText);
  paymentList.appendChild(amountText);;

  allPayments.appendChild(paymentList);
}

function myPayment(type, amount){
  let myPayment=document.getElementById("myPayment");

  let paymentList = document.createElement('tr');
  
  let typeText=document.createElement("td");
  typeText.innerText=type;

  let amountText=document.createElement("td");
  amountText.innerHTML=amount + "æ";

  paymentList.appendChild(typeText);
  paymentList.appendChild(amountText);;

  myPayment.appendChild(paymentList);
}

window.addEventListener('load', async () => {
  $("#loader").show();

  client = await Ae.Aepp();
  contractInstance = await client.getContractInstance(contractSource,{contractAddress});

  // let allPayments=(await contractInstance.methods.getPayment()).decodedResult;
  // allPayments=map(payment=>{
  //   allPayments(payment.name, payment.matric, payment.payType, payment.amount)
  // });

  let myPay=(await contractInstance.methods.userPayment()).decodedResult;
  myPay=map(payment=>{
    myPayment(payment.payType, payment.amount)
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
