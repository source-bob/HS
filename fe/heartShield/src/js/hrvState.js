const HRVState = {
    heartRate: null,
    hrvStatus: null,
    rrMetrics: null,
    subscribers: [],

    setHeartRate(hr) {
        this.heartRate = hr;
        this.notifySubscribers();
    },

    setHRVStatus(status) {
        this.hrvStatus = status;
        this.notifySubscribers();
    },

    setRRMetrics(metrics) {
        this.rrMetrics = metrics;
        this.notifySubscribers();
    },

    getHeartRate() {
        return this.heartRate;
    },

    getHRVStatus() {
        return this.hrvStatus;
    },

    getRRMetrics() {
        return this.rrMetrics;
    },

    subscribe(callback) {
        this.subscribers.push(callback);
        // Возвращаем функцию отписки
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index !== -1) {
                this.subscribers.splice(index, 1);
            }
        };
    },

    unsubscribe(callback) {
        // Проверяем, есть ли подписчик в массиве, и удаляем его, если он есть
        const index = this.subscribers.indexOf(callback);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    },

    notifySubscribers() {
        const data = {
            heartRate: this.heartRate,
            hrvStatus: this.hrvStatus,
            rrMetrics: this.rrMetrics,
        };
        this.subscribers.forEach(callback => callback(data));
    }
};

export default HRVState;
