function openEditor(url) {
	newwindow=window.open(url,'name','height=800,width=500');
	if (window.focus) {newwindow.focus()}
	return false;
}