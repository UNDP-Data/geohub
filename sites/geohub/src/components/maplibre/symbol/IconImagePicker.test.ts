import { describe, test } from 'vitest';

describe('IconImagePicker', () => {
	test.todo(
		'Please pass for now. There is an error of ERR_UNSUPPORTED_DIR_IMPORT when import svelte-undp-design package.'
	);
});

// import { describe, beforeEach, expect, it, vi } from 'vitest'
// import { cleanup, render, within, fireEvent, type RenderResult } from '@testing-library/svelte'

// import IconImagePicker from '$components/controls/vector-styles/IconImagePicker.svelte'
// import { spriteImageList } from '$stores'

// const spriteListData = [
//   {
//     alt: 'aerialway',
//     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAAAkxJREFUaEPtmjtKBEEQhr+NREHFZ+gj0xMYiCcQTQQx8BjmPmIzDyEGJnoC8QCmJqJi5AMFRcVIKdmR3rZ3Z3q6t4dlamDZZbe7q76qv2oevQ1qdjRqxosC91DGR4GZNq9p4AtYA85NptQZngAOgGX4VdcRsAfcOgI91gFGgIYKJOcRmKwKeB44AwTaPB6AfWDKABSgwQJAeUOSAovDmeQEYBNYyPMw4u8CG1XSwxaQWU8CKDXWzeMNuGm+ro3P2XcvLuOdanjEqiGBMKEEuJvHexuYDO65jHEX8BJw7Ki1MusXnXMBHFqAT0Un+4xzAUsTsRuLz5rZWFNyIrM7YMvumsA9sAhclTHiOycE+NWoGzmtZLWTvbskJ53YPgXNNuf6+l5qfCdJ9zkgTChnUyjgxbc1Jum1QFJjTVAFLqCKaEM0w9FC2X4hlXSCIP+ZUEkniLZKOkGQcyU9B+wCK0B/Soci2PoEToFt4NJez1XDAiuPRcYjGK9yCbn5kBuhFmgXsDx2Wa/S04i2hWXDXM8F/NGDMm4XI5H3QB6w3UUjBrySpVqS6sqwAleSl3hGNcN2LPMkHXo5GvtKy8vfMjWswJ7lphn2DFhQCaqkAa8mUCI7KukSQTOneCVIJa2S/q83PQ971qA2Lc+A6Xk4J2DBd0taw56S1Br2DFjyGg70L/n04BpO7nGgQQX2rYnAgCefrhnWDCcXXXcNqqTt+NZuM61226W12xAXiQv0DrDag3vFsid80vS/0F8eutszK1499N62Yvf9zdcO+Adalp09ECGK6QAAAABJRU5ErkJggg==',
//   },
//   {
//     alt: 'library',
//     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAABSRJREFUaEPtmleoLEUQhr9rzjliwqwYMWcxIYqoDwZUDCiKAbPig6gIKqKYI+o1PaiIGFHErJhFH1RQUcw555z4oOewZ86E7t2Z4ey5WzAs7PRU919VXVVd1dOYwWjaDIaXEeCprvGRhkcanmISGJn0FFPoBDgjDSdqeGZgZWBpYElgPuAz4GPgTeDHRH7ZcPmsBiwT+P4Q+H4EvA382yffvhKPFYDtge3Cs3DJ5L8C1wOXhkXGrHEV4FjgIGCukg++BB4FHgm/H8QwzsbEmvQcwB7AUcAmKRMA/wHHAJfXfHc0cAkkK+GpwPse4M+6tdUB1lQPBw4DFq1jVvNeHteWjDkUuGZA/p8CVwc+X5TxqgJ8HnAC4D5tgjTxFYHPc8zc++9UmHDq3Gr5TOCcog+rAOsodB5N0pVhW/Ty9L8jmpwEeB9YPgWwe/a3hhchO4W4QI7v98D8Dc/1CzBPCmD3riGgDcpblU6tDRKwwMdRmUmvB7zcxioKvHBbgA2f78UC3hF4cMgBGz5fiAW8P3DzkAPeFbgvFrDh6IIhB2xsvy4W8LnAKUMO+NSiWFzmtKYDBw85YNPU42I1rO3vMuSAbwX2jQX8PLDxkAN+LJzmouLwu2WpWQNC6CrxeB1YK1bDP5WlZkME2HPz4jGA5wQ82bRFXWnYDG5W4J9eIEVeelkgqYqQKJmuALssNaymx6gI8AbAS4kgUoZ3Cdg97F6uBLwT8EAKgsSxXQK27qa3rgR8IHBjIoiU4V0C3ge4rQ7wScD5KQgSx3YJ2EzLjKtSw9ayTk4EkTK8S8DWtcypKwFrzpp1W9QlYE9LnpoqAd8P7NwW2g4rHkK4F9itDrAhydBURrY5XgGeBF4NLRDbK7ZVrHJakLMbYcVhG2DDXKm3SsMmCc7/OGA+/00o/GW8Len6rA1sDViKmqlirVY8xjUOiuKwJc7lckyc8CZA7T+X2DOaF9gLOB4wi7MXlfWGXKy9IiukFwG3A6a1saSANw0nuwMKysrWtKxtVZq0aaULk9TgFcAtwM+xq6gYNwvwd+590X/9TGWV0uOg7SAtQJpQrs1rWIm/GMzI6v3Tg3Tq+ll1A9+IYQvgjLC9NurFUNdbamD+ycWiX8BLAFsBW4Zzs402nz+AD8Phw5amHb3fEyF7wjG9tSVrf9imwOzAV4BNMs/qdgyfKSq0182VAnihEJ8PAdaoYxzefxec3WkRPsB+8OmhlhbTqfwLeDZUJu+IFWwMYN26LdO9AXtO/dBbwJ7AayUfrx489Jr9MAe+Bm4I7VItoJSqABvjLgM263MR+c80bU31idyLzYGHGmqXeui/GzixqM3ivEWAFwTOCi3MKoGYJLhfTQ6+Bfxu1ZoWq+NMRDItWGww0VisQqiGMeOpXcZFwmNsryKFe3Y4BOlXxqgIkInASiXcfOdZ2fsVOo6iSyvrBgnvVyJQtZCVXWy2lwn1LuDikOi4X3tJQenUdghP2T0T84h16gDbQddT9pIZlseshxPM27Oo/SkTixQyCzPh90JMDM0W/IuXYdYv+GCcQIukmwFWC97JuDDhFk5+PtPFCdX/GhRXAUfGIC0Yoz/waNt7YKgFbJtUu7e35F2rQci7Vm8kMtAENcVByPzAZmB232uMV0xYGmRizflOYFtg7hpGCtn60+4x148iFzUhT28bcLYunZOxdqkQfkwyfNw+n4RHzz3Oo0aCShrWFeCkRbU5eAS4TelOBt4jDU8GLbS5hpGG25TuZOD9P4WL8j0WjWwWAAAAAElFTkSuQmCC',
//   },
//   {
//     alt: 'logging',
//     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAABQ9JREFUaEPtmkvIVkUYx38fZiYFBanZBTdZkXkhoaIL3e8QtWpVqzatXGhBe6EW0cpFiy5Q1Ko2LSrSNCGNwu6lXeyeFWLpIswyCvnHzMfzPZx5Z85533M8p+8bEPnemTPn+c0zz2WeOVPMsjY1y3iZA/6/a3yIGr4GuB54BvjGKOhq4GbgX+Al4L0q5Q0R+BBwGvAzcB3wK/A0cKcDfAK4PyzAdNcQgT8BVgaCX4B/gHMSprgO2GT7hgh8NrAdWF7gbz4HLhwacJXNyoa3GpBPgSeBecBj5vc/gJOHBuxtVrtSGl4aQASrBTgAnAQcMYC7gEuHBuxtVsARVn03BFhxXQy8bwDvAZ4fGnDKZj3samAbcHoAfA6419t5H53WVcCNwLMmzt4GvGKEz8Fq6CXAu0MAli0uMnFWdmk1J1jZrOKvmtdsZIxx+su+b+mPgVUmzp5otmkOVg5MCxRDlv6Oc/03ZR+3tJKINyrirBZCDiql2eittUAxTvcS+Epjs98GzXqbzcHqMdn+zvD8kpBXvwl837ctLY3Js0ab8zZbAismpZnXAjNsto9Oa5TNfhS0P2obW5uVjcuJJVsfbDgVZ0tg5a2tzfYSWDZ7E6DE4KuEzeZgq2xWc+7wNtuHLb0fkFOJNudtVrDyxr9l4myRzfYB+ENgTSLO5mB9nM1u4T4Anxni7AVOmBJYb7NyeHHxRvmq6b4unNYtwGWhBhVjorbs60ZCaV3586htLNt/y8RZ2azi7A9FpGFQF8C/A6eEOKs4KZvV4X1xkKEEVkP3ASoG2MJdHdbOUkvZ3UUJm83BepvdbepZtWG7yqVTcbYE1tvsXuD8RqQjtrRqQBvMlvPz/xmOa5tDxdD3Xx7yWJ1nU7lxDtbH2TNCGfZV4MdJA28JDiQ37zvAHaa8EsdLozrtyG6jzdrzbAms5moUZ3NCe6c1Hziae8j0fx206R2Jhbbn2Q/CYh5MJBVjx9mc7B7YV/1yz6v/u3A0+8kNjtDnhd9LYMeOszmBc8C6p1nvJlEF4T732xfh2kPb0LazwvY+nNGst1mlno3i7LjAf4fTiJ/nAeBR96POodKQ17Qyq7+A1DaO07Ris17wnIZTwHJISih80+lHF1xKEqqaL7h5m91jYnZOWY36mwKPsnU5MkFXhQ+VYK4IklbVoD4DVjQiKXyoDWC9Wl5b0D7PtY7M16BuDblxjN2FCPWGtQUsKSS4oGcU0YCYeSnBUb8cXmetTWBBKGQJSv/bFqHlzOJdbyfQbQMLQhoWtN+qqj8/HrK1TmD1kqbA/pYuJ7BsWdBjHe1yLynpbwKcusvJvU9eW9Dy4seteeAFgE5Dsen7iRPM301h4xSKz4KO1crOwT2w4JRs2Kbzp86h48LGOZWJCVpzdt6qSjxa/XONJBuBF92V5biCvgYo7nbeqoAfAR4ykuibCX0cEm/WxxXSX2aPO1+t56uA16a+Yqs1c/VgfzE2gSnrTZGqWr4M3F5vquxof32SfaCNASlglVBVAy75+KtELl9kL3mmlTGj6tK+YtFUAF/DajrPRJ7LFeIFrQJc09Jor2C1YjlgjVGZRtD+Lii34r6GlRvfSX8JsATRl2+6Hik9nOvO5y5T1ukEpuQlpcCaa2Eo3j0ILEtMrnz5KeDhioytRJ7Wx9QBjsKodn130PapgP7pG4wXgLf9B9mtE9R8QRPgmq/o1/A54H7pY/LSzGl48mvarxmPAcAdS0zc8iTHAAAAAElFTkSuQmCC',
//   },
//   {
//     alt: 'volcano',
//     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAABGdJREFUaEPtmlvIVUUUx3+aN/CSQtlTKpWYaURCEkZiZkioeZe80oWQEkGpF33wQfA1X0JURB8iRSlUlECpULOLYZYaXlKSBAUVMbxERF74f8yG3WafPbP3zPjt43fW08d3Ztb6/2btM3vNmtOJDmadOhgvLeAHPeOtDLcyHH8F3gDWAXeB6cAPMUO29yP9PPA90MNAXgYeqzuwxH5gRK8B/nIU/AhwGBiYGR81CSGcbwemGNEngXHARQt0F2APMDZnXAhNDcOHcH4d6J2K8IeBPlcA/TGwtMHnITRFBd4CvJmJcMFAn8qJPA/4tGAxag/8KHA8Z7O5ArwGHE3BjQC+S21SedxZYH3H3wZuARuBq457RO6wUKs5EdiVE0Eb2OvAj4AWRpvUAIvgRNMLwIfADOAhM0cx9BqrbKGAJWA98F6OEmVmKrAMeMVBqTZAgb7cYAH7OfiI+h1OnPcCfgWe9BFkmav9Yo6P/5AZlo5RwLdAZx9RDeZuABYB//r4Dg0sLauA5T6iMnNVcn4E6FXmbTGAu5lNSmVjnl0DvjAfaEPqW0BxE5gN7PYmNQ5iAMv1M8ARoHtG6DdmA1OxInsYUKWWt5mdByYBx0LByk8sYPleAqxOiT1kSsm/MwA9AS3EyNT/dWLSzn4pJGxsYG1cnwDvmsJkGqCs5dnjwOfA08A2YDHwT2jY2MAx9Hr7jPlIe4uL4aAFHGNV6+QzdIZHAzuBz4CVgFo2Vaw/sAKYC0wGDlRxkjcnNPDXqS6Guh9jKkALdh8w1AiWT3VRglhI4JeAgxlV6nGp/k2b6m29gmSqtNTES5vmvJ/5n3xnx1VagJDAe82BPy3kBtAno0zFhLIoy+tSZltGGiff4ysRZiaFAn6xoJ+cjaHDQNpsnydjFUPVmpeFAv7SdDbyxNiAbJ8nPhVjghdtoFparZifCoTYgPR4q/8l099F9bNiqU1U2UJkWH0m9bQamQ14P6A6W6aTk15tjazde1rqQv5sWW4bcNlsKeYvZScl430zvMMUBkXxQwMrpo6OlcwH+DnTtLMFDg2seIpdqTHgA6ziQdebNosBrNgzbYHzPq8KPNwc6l1iltmFXfwlY54FfiszQWOrAm8FZjkGK7MLO7psGyYN2Tst6/wqwGrQaWWrzLUKKjFAFdswQIcUZ6sierNpnToHiThQWnSEdLaywEOAE5FuFpxFpwbeMcfI310nlwXWva7ud+tk0rTAVVAZ4KeA0zXKbsJ427R3z7pAlwHeBLzl4rQdxkjbOy5xXYGfAPQ9SS6mXXzfzzHK8mCg6HclbXpcgXVVqRuEOps05l3I/0+zC/Ag4AygnxrV2f4DtM/8WSTSBXgtsLDOpClt0pptAJbOsG7cuzYJsG4mdRvZ0FwyrEelrptVFkyFSKFWF+CvgFebJMO6V1bf2yvD+l2VdkBBx/ixSoi11EFCvziYbztMuGQ4ESTYuj7aeg/rcbZaGWCrs2YY0AJuhiz5aGxl2Gf1mmHuPbnypj1tNI/fAAAAAElFTkSuQmCC',
//   },
// ]

// spriteImageList.set(spriteListData)

// beforeEach(cleanup)

// describe('Icon Image Picker : Card Style', () => {
//   let sut: RenderResult
//   let container: HTMLElement

//   beforeEach(() => {
//     sut = render(IconImagePicker, {
//       iconImageAlt: 'circle',
//     })
//     container = sut.getByTestId('icon-image-picker-container')
//   })

//   it('should render the container', () => {
//     expect(container).toBeDefined()
//   })

//   it('should render 3 tabs', async () => {
//     const tabs = sut.getAllByTestId('group-letter-tab')
//     expect(tabs.length).toEqual(3)
//   })

//   it('should render the default tab of "A - H"', async () => {
//     const tabs = sut.getAllByTestId('group-letter-tab')
//     const defaultTab = tabs[0]
//     expect(defaultTab).toHaveClass('is-active')
//   })

//   it('should render the default tab of "A - H" with one icon', async () => {
//     const iconPickerCards = sut.getAllByTitle('Icon Picker Card')
//     expect(iconPickerCards.length).toEqual(1)
//   })

//   it('should dispatch an event upon click of close', async () => {
//     const closeButton = sut.getByTitle('Close Icon Picker')
//     expect(closeButton).toBeDefined()

//     const mockCloseButtonEvent = vi.fn()
//     let dispatchContent = []

//     sut.component.$on('handleClosePopup', function (event) {
//       mockCloseButtonEvent(event.detail)
//       dispatchContent = event.detail
//     })

//     await fireEvent.click(closeButton)
//     expect(mockCloseButtonEvent).toHaveBeenCalledTimes(1)
//     expect(mockCloseButtonEvent).not.toHaveBeenCalledTimes(2)
//     expect(dispatchContent).toEqual(null)
//   })

//   it('should render the tab of "I - Q" upon click, display two icons, and call dispatch upon click of icon', async () => {
//     // click link
//     let tabs = sut.getAllByTestId('group-letter-tab')
//     const link = within(tabs[1]).getByText('I - Q')
//     await fireEvent.click(link)

//     tabs = sut.getAllByTestId('group-letter-tab')
//     expect(tabs[0]).not.toHaveClass('is-active')
//     expect(tabs[1]).toHaveClass('is-active')
//     const iconPickerCards = sut.getAllByTitle('Icon Picker Card')
//     expect(iconPickerCards.length).toEqual(2)

//     // click icon
//     const mockIconButtonEvent = vi.fn()
//     let dispatchContent = []

//     sut.component.$on('handleIconClick', function (event) {
//       mockIconButtonEvent(event.detail)
//       dispatchContent = event.detail
//     })

//     await fireEvent.click(iconPickerCards[0])
//     expect(mockIconButtonEvent).toHaveBeenCalledTimes(1)
//     expect(mockIconButtonEvent).not.toHaveBeenCalledTimes(2)
//     expect(dispatchContent).toEqual({ spriteImageAlt: 'library' })
//   })
// })
