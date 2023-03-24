import { browser, by, element, promise } from 'protractor';

export class AppPage {
  navigateTo(destination): promise.Promise<any> {
    return browser.get(destination);
  }

  getTitle(): promise.Promise<string> {
    return browser.getTitle();
  }

  getPageOneTitleText(): promise.Promise<string> {
    return element(by.tagName('app-home'))
      .element(by.deepCss('ion-title'))
      .getText();
  }
}
