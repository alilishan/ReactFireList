import Swal from 'sweetalert2';


export function UpdateQueryString(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

export function SwalError(message) {
	Swal.fire(message);
}


export function SwalToast(message, type){
	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000,
		timerProgressBar: true,
		onOpen: (toast) => {
			toast.addEventListener('mouseenter', Swal.stopTimer)
			toast.addEventListener('mouseleave', Swal.resumeTimer)
		}
	});

	Toast.fire({
		icon: (typeof type === 'undefined')? 'info' : type,
		title: message
	});
}


export function SwalConfirm(btnText){
	return new Promise((resolve, reject) => {

		Swal.fire({
			title: 'Are you sure?',
			text: 'This action cannot be undone!',
			// icon: 'warning',
			buttonsStyling: false,
			reverseButtons: true,
			showCancelButton: true,
			customClass: {
				title: 'swal-title',
				content: 'py-3',
				confirmButton: 'swal-btns btn btn-danger',
				cancelButton: 'swal-btns btn btn-link'
			},
			confirmButtonText: (btnText)? btnText : 'Yes, Delete it!',
			cancelButtonText: 'Cancel'
		}).then((result) => {
			if (result.value) {
				resolve();
			} else {
				reject();
			}
		})

	});
}


export function SwalInput(value){
	return new Promise((resolve, reject) => {

		Swal.fire({
			title: 'Rename List',
			input: 'text',
			inputValue: value,
			inputAttributes: {
				autocapitalize: 'off'
			},
			customClass: {
				title: 'swal-title',
				content: 'py-0',
				confirmButton: 'swal-btns btn btn-success',
				cancelButton: 'swal-btns btn btn-link',
				input: 'form-control',
			},
			showCancelButton: true,
			confirmButtonText: 'Save',
			showLoaderOnConfirm: true,
			buttonsStyling: false,
			reverseButtons: true,
			preConfirm: (text) => {
				return text === ''? false : text;
			},
			allowOutsideClick: () => !Swal.isLoading()
		}).then((result) => {
			if (result.value) {
				resolve(result);
			} else {
				reject();
			}
		})

	});
}



export function SwalChoose(values, label, title){
	return new Promise(async (resolve, reject) => {

		const { value: choice } = await Swal.fire({
			title: title,
			input: 'select',
			inputOptions: values,
			inputPlaceholder: label,
			showCancelButton: true,
			customClass: {
				title: 'swal-title',
				content: 'py-0',
				confirmButton: 'swal-btns btn btn-success',
				cancelButton: 'swal-btns btn btn-link',
				input: 'form-control',
			},
			buttonsStyling: false,
			reverseButtons: true,
			confirmButtonText: 'Choose',
			inputValidator: (value) => {
				return new Promise((resolve) => {
					if (value === '') {
						resolve('You need to Select a User')
					} else {
						resolve();
					}
				})
			}
		});

		if(choice){
			resolve(choice);
			Swal.close();
		} 

	});
}