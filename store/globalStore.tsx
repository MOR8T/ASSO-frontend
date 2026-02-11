import { makeAutoObservable } from "mobx";

class GlobalStore {
  // INITIAL STATE #################################
  // Индикатор загрузки (можно использовать и для запросов, и для сабмита)
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this); // Делает свойства реактивными
  }

  // ACTIONS
  setLoading(value: boolean) {
    this.loading = value;
  }
  setError(value: string | null) {
    this.error = value;
  }
}

const globalState = new GlobalStore();
export default globalState;
