(async function() {
    
    window.courses = {};

    try {
        const response1 = await fetch('./courses/course1.json');
        window.courses[1] = await response1.json();
    } catch (error) {
        console.error('Error loading course1.json:', error);
        alert('Failed to load course1.json. Check console for details.');
    }

    try {
        const response2 = await fetch('./courses/course2.json');
        window.courses[2] = await response2.json();
    } catch (error) {
        console.error('Error loading course2.json:', error);
        alert('Failed to load course2.json. Check console for details.');
    }

    try {
        const response3 = await fetch('./courses/course3.json');
        window.courses[3] = await response3.json();
    } catch (error) {
        console.error('Error loading course3.json:', error);
        alert('Failed to load course3.json. Check console for details.');
    }

    window.dispatchEvent(new CustomEvent('coursesLoaded'));

})();
