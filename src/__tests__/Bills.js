/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import {formatBills} from "../containers/Bills.js"

import router from "../app/Router.js";

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
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = formatBills(bills)
      document.body.innerHTML = BillsUI({ data: sortedBills })
      const dates = screen.getAllByText(/^\d{1,2} (Jan.|Fév.|Mar.|Avr.|Mai|Juin|Juil.|Aoû.|Sep.|Oct.|Nov.|Déc.) \d{2}$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => {
          const parseDate = (dateStr) => {
              const [day, month, year] = dateStr.split(' ');
              const monthIndex = [
                  "Jan.", "Fév.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Aoû.", "Sep.", "Oct.", "Nov.", "Déc."
              ].indexOf(month);
              return new Date(`20${year}`, monthIndex, day);
          };
          return parseDate(b) - parseDate(a);
      };
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
