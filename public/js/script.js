document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 1s ease-out';
            alert.style.opacity = '0';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 1000);
        }, 5000);
    });
    
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });
    
    const saleOffInput = document.getElementById('saleOff');
    if (saleOffInput) {
        saleOffInput.addEventListener('change', function() {
            const value = parseFloat(this.value);
            if (value > 1) {
                this.value = (value / 100).toFixed(2);
            }
        });
    }
});