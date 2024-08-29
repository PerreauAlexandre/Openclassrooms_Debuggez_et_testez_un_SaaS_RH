/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should see the new bill form", () => {
      document.body.innerHTML = NewBillUI()
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })
    test("Then newBill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.className).toContain('active-icon')
    })
    test("Then I should be able to select a file with a valid extension", () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener('change', handleChangeFile)

      userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0].name).toBe('test.png')
    })
    test("Then I shouldn't be able to select a file with an invalid extension", () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })

      window.alert = jest.fn()

      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener('change', handleChangeFile)

      userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.value).toBe('')
    })
    test("Then I should be able to submit the form", async () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      
      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      userEvent.upload(fileInput, file)
      userEvent.type(screen.getByTestId('expense-name'), 'Test Expense')
      userEvent.type(screen.getByTestId('amount'), '100')
      userEvent.type(screen.getByTestId('datepicker'), '2024-08-25')
      userEvent.type(screen.getByTestId('vat'), '20')
      userEvent.type(screen.getByTestId('pct'), '10')
      userEvent.type(screen.getByTestId('commentary'), 'Test commentary')
      userEvent.selectOptions(screen.getByTestId('expense-type'), 'Restaurants et bars')

      const sendButton = screen.getByTestId("btn-send-bill")
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      sendButton.addEventListener("click", handleSubmit)
      userEvent.click(sendButton)
      expect(handleSubmit).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId('employee-content'))
      const employeeContent = screen.queryByTestId('employee-content')
      expect(employeeContent).toBeTruthy()
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("Then send new bill with mock API POST", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const email = JSON.parse(localStorage.getItem("user")).email

      const bill = new FormData()
      bill.append('file', file)
      bill.append('email', email)
      bill.append('type', 'Restaurants et bars')
      bill.append('name', 'Test Expense')
      bill.append('amount', '100')
      bill.append('date', '2024-08-25')
      bill.append('vat', '20')
      bill.append('pct', '10')
      bill.append('commentary', 'Test commentary')
      bill.append('status', 'pending')

      await newBill.createBill(bill)

      expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg')
      expect(newBill.billId).toBe('1234')
    })
  })
  describe("When an error occurs on API", () => {
    test("Then send new bill with mock API POST with 400 message error", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const email = JSON.parse(localStorage.getItem("user")).email

      const bill = new FormData()
      bill.append('file', file)
      bill.append('email', email)
      bill.append('type', 'Restaurants et bars')
      bill.append('name', 'Test Expense')
      bill.append('amount', '100')
      bill.append('date', '2024-08-25')
      bill.append('vat', '20')
      bill.append('pct', '10')
      bill.append('commentary', 'Test commentary')
      bill.append('status', 'pending')

      const consoleErrorMock = jest.fn()
      console.error = consoleErrorMock

      mockStore.bills().create = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('Erreur 400'))
      })
    
      await newBill.createBill(bill)
    
      expect(consoleErrorMock).toHaveBeenCalledTimes(1)
    
      const loggedError = consoleErrorMock.mock.calls[0][0]
      expect(loggedError).toBeInstanceOf(Error)
      expect(loggedError.message).toBe('Erreur 400')
    })
    test("Then send new bill with mock API POST with 400 message error (Bad Request)", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const email = JSON.parse(localStorage.getItem("user")).email

      const bill = new FormData()

      const consoleErrorMock = jest.fn()
      console.error = consoleErrorMock

      mockStore.bills().create = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('Erreur 400'))
      })
    
      await newBill.createBill(bill)
    
      expect(consoleErrorMock).toHaveBeenCalledTimes(1)
    
      const loggedError = consoleErrorMock.mock.calls[0][0]
      expect(loggedError).toBeInstanceOf(Error)
      expect(loggedError.message).toBe('Erreur 400')
    })
    test("Then send new bill with mock API POST with 401 message error (Unauthorized)", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const email = JSON.parse(localStorage.getItem("user")).email

      const bill = new FormData()
      bill.append('file', file)
      bill.append('email', email)
      bill.append('type', 'Restaurants et bars')
      bill.append('name', 'Test Expense')
      bill.append('amount', '100')
      bill.append('date', '2024-08-25')
      bill.append('vat', '20')
      bill.append('pct', '10')
      bill.append('commentary', 'Test commentary')
      bill.append('status', 'pending')

      const consoleErrorMock = jest.fn()
      console.error = consoleErrorMock

      mockStore.bills().create = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('Erreur 401'))
      })
    
      await newBill.createBill(bill)
    
      expect(consoleErrorMock).toHaveBeenCalledTimes(1)
    
      const loggedError = consoleErrorMock.mock.calls[0][0]
      expect(loggedError).toBeInstanceOf(Error)
      expect(loggedError.message).toBe('Erreur 401')
    })
    test("Then send new bill with mock API POST with 500 message error (Internal Server Error)", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const email = JSON.parse(localStorage.getItem("user")).email

      const bill = new FormData()
      bill.append('file', file)
      bill.append('email', email)
      bill.append('type', 'Restaurants et bars')
      bill.append('name', 'Test Expense')
      bill.append('amount', '100')
      bill.append('date', '2024-08-25')
      bill.append('vat', '20')
      bill.append('pct', '10')
      bill.append('commentary', 'Test commentary')
      bill.append('status', 'pending')

      const consoleErrorMock = jest.fn()
      console.error = consoleErrorMock

      mockStore.bills().create = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('Erreur 500'))
      })
    
      await newBill.createBill(bill)
    
      expect(consoleErrorMock).toHaveBeenCalledTimes(1)
    
      const loggedError = consoleErrorMock.mock.calls[0][0]
      expect(loggedError).toBeInstanceOf(Error)
      expect(loggedError.message).toBe('Erreur 500')
    })
  })
})