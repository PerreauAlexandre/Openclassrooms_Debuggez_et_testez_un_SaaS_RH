/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    test("Then I should see the new bill form", () => {
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })
    test("Then newBill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.className).toContain('active-icon')
    })
    test("Then I should be able to select a file with a valid extension", async () => {
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const fileInput = screen.getByTestId('file')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      await userEvent.upload(fileInput, file)

      console.log('fileInput.files:', fileInput.files[0])

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(newBill.fileName).toBe('test.png')
    })
  })
  // describe("When I am on NewBill Page and add a file", () => {
  //   test("File format should be tested", async () => {
  //     // A compléter
  //     // 
  //     // 
  //     // 
  //     // 
  //     // 
  //   })
  // })
  // describe("When I am on NewBill Page and add a new bill", () => {
  //   test("New bill should be created", async () => {
  //     const onNavigate = (pathname) => {
  //       document.body.innerHTML = ROUTES({ pathname })
  //     }

  //     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  //     window.localStorage.setItem('user', JSON.stringify({
  //       type: 'Admin'
  //     }))

  //     const dashboard = new NewBill({
  //       document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
  //     })
  //     document.body.innerHTML = DashboardUI({ data: { bills } })
  //   })
  // })
})




// describe("Given I am connected as an employee", () => {
//   describe("When I am on the NewBill Page", () => {
//     beforeEach(() => {
//       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//       window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH['NewBill'])
//     })

//     test("Then I should see the new bill form", () => {
//       document.body.innerHTML = NewBillUI()
//       const formNewBill = screen.getByTestId("form-new-bill")
//       expect(formNewBill).toBeTruthy()
//     })

//     test("Then I should be able to select a file with a valid extension", () => {
//       document.body.innerHTML = NewBillUI()
//       const newBillInstance = new NewBill({ document, onNavigate: () => {}, store: null, localStorage: window.localStorage })
//       const fileInput = screen.getByTestId('file')
      
//       const file = new File(['dummy content'], 'example.png', { type: 'image/png' })
//       Object.defineProperty(fileInput, 'files', { value: [file] })
      
//       const handleChangeFile = jest.spyOn(newBillInstance, 'handleChangeFile')
//       fireEvent.change(fileInput)

//       expect(handleChangeFile).toHaveBeenCalled()
//       expect(newBillInstance.fileName).toBe('example.png')
//     })

//     test("Then I should not be able to select a file with an invalid extension", () => {
//       document.body.innerHTML = NewBillUI()
//       const newBillInstance = new NewBill({ document, onNavigate: () => {}, store: null, localStorage: window.localStorage })
//       const fileInput = screen.getByTestId('file')
      
//       const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' })
//       Object.defineProperty(fileInput, 'files', { value: [file] })
      
//       const handleChangeFile = jest.spyOn(newBillInstance, 'handleChangeFile')
//       fireEvent.change(fileInput)

//       expect(handleChangeFile).toHaveBeenCalled()
//       expect(fileInput.value).toBe('')  // Input value should be cleared for invalid file
//     })

//     test("Then I should be able to submit the form", async () => {
//       document.body.innerHTML = NewBillUI()
//       const newBillInstance = new NewBill({ document, onNavigate: () => {}, store: mockStore, localStorage: window.localStorage })
//       const form = screen.getByTestId('form-new-bill')
      
//       const createBill = jest.spyOn(newBillInstance, 'createBill').mockImplementation(() => Promise.resolve({ fileUrl: 'http://test.com', key: '1234' }))
//       const onNavigate = jest.fn()
//       newBillInstance.onNavigate = onNavigate

//       const fileInput = screen.getByTestId('file')
//       const file = new File(['dummy content'], 'example.png', { type: 'image/png' })
//       Object.defineProperty(fileInput, 'files', { value: [file] })

//       // Fill out form fields
//       userEvent.type(screen.getByTestId('expense-name'), 'Test Expense')
//       userEvent.type(screen.getByTestId('amount'), '100')
//       userEvent.type(screen.getByTestId('datepicker'), '2024-08-25')
//       userEvent.type(screen.getByTestId('vat'), '20')
//       userEvent.type(screen.getByTestId('pct'), '10')
//       userEvent.type(screen.getByTestId('commentary'), 'Test commentary')
//       userEvent.selectOptions(screen.getByTestId('expense-type'), 'Restaurants et bars')

//       fireEvent.submit(form)

//       await waitFor(() => expect(createBill).toHaveBeenCalled())
//       expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
//     })
//   })
// })