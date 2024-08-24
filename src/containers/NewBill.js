import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault()
    const filePath = e.target.value.split(/\\/g)
    this.fileName = filePath[filePath.length-1]
    const validExtensions = ['.png', '.jpg', '.jpeg']
    const fileExtension = this.fileName.slice(this.fileName.lastIndexOf('.')).toLowerCase()
    if (!validExtensions.includes(fileExtension)) {
        alert('Veuillez sélectionner un fichier de type .png, .jpg ou .jpeg.')
        e.target.value = ""
        return
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)

    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const email = JSON.parse(localStorage.getItem("user")).email
    const type = e.target.querySelector(`select[data-testid="expense-type"]`).value
    const name = e.target.querySelector(`input[data-testid="expense-name"]`).value
    const amount = parseInt(e.target.querySelector(`input[data-testid="amount"]`).value)
    const date = e.target.querySelector(`input[data-testid="datepicker"]`).value
    const vat = e.target.querySelector(`input[data-testid="vat"]`).value
    const pct = parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20
    const commentary = e.target.querySelector(`textarea[data-testid="commentary"]`).value
    const status = 'pending'

    const bill = new FormData()
    bill.append('file', file)
    bill.append('email', email)
    bill.append('type', type);
    bill.append('name', name);
    bill.append('amount', amount);
    bill.append('date', date);
    bill.append('vat', vat);
    bill.append('pct', pct);
    bill.append('commentary', commentary);
    bill.append('status', status);

    this.createBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  createBill = (bill) => {
    this.store
    .bills()
    .create({
      data: bill,
      headers: {
        noContentType: true
      }
    })
    .then(({fileUrl, key}) => {
      // console.log(fileUrl)
      // console.log(key)
      this.billId = key
      this.fileUrl = fileUrl
      this.onNavigate(ROUTES_PATH['Bills'])
    })
    .catch(error => console.error(error))
  }
}