/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills, {formatBills} from "../containers/Bills.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.className).toContain('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = formatBills(bills)
      document.body.innerHTML = BillsUI({ data: sortedBills })
      const dates = screen.getAllByText(/^\d{1,2} (Jan.|Fév.|Mar.|Avr.|Mai|Juin|Juil.|Aoû.|Sep.|Oct.|Nov.|Déc.) \d{2}$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => {
          const parseDate = (dateStr) => {
              const [day, month, year] = dateStr.split(' ')
              const monthIndex = [
                  "Jan.", "Fév.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Aoû.", "Sep.", "Oct.", "Nov.", "Déc."
              ].indexOf(month)
              return new Date(`20${year}`, monthIndex, day)
          }
          return parseDate(b) - parseDate(a)
      }
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I am on bill page and I click on the button to create a new bill', () => {
    test('Then, it should navigate to the NewBill page', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({ data: bills })
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const acceptButton = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn((e) => billsInstance.handleClickNewBill())
      acceptButton.addEventListener("click", handleClickNewBill)
      fireEvent.click(acceptButton)
      expect(handleClickNewBill).toHaveBeenCalled()
      const formNewBill = screen.queryAllByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })
  })
  describe('When I am on bill page and I click on a icon eye', () => {
    test('Then, a modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({ data: bills })
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      
      const iconEyes = screen.getAllByTestId('icon-eye')
      const iconEye = iconEyes[0]
      const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFileEmployee')
      expect(modale).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      document.body.innerHTML = ''
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentPending  = await screen.getByText("Mes notes de frais")
      expect(contentPending).toBeTruthy()
      const tableBody = screen.getByTestId('tbody')
      expect(tableBody.children.length).toBe(4)
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})