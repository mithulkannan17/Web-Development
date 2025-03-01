from django.shortcuts import render, get_object_or_404, redirect
from .models import Student
from django.http import HttpResponse

def student_list(request):
    students = Student.objects.all()
    return render(request, 'students/student_list.html', {'students': students})


def student_create(request):
    if request.method == 'POST':
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        email = request.POST['email']
        phone_number = request.POST['phone_number']
        date_of_birth = request.POST['date_of_birth']
        
        Student.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone_number=phone_number,
            date_of_birth=date_of_birth
        )
        return redirect('student_list')
    
    return render(request, 'students/student_form.html')


def student_update(request, id):
    student = get_object_or_404(Student, id=id)
    if request.method == 'POST':
        student.first_name = request.POST['first_name']
        student.last_name = request.POST['last_name']
        student.email = request.POST['email']
        student.phone_number = request.POST['phone_number']
        student.date_of_birth = request.POST['date_of_birth']
        student.save()
        return redirect('student_list')
    
    return render(request, 'students/student_form.html', {'student': student})


def student_delete(request, id):
    student = get_object_or_404(Student, id=id)
    if request.method == 'POST':
        student.delete()
        return redirect('student_list')
    
    return render(request, 'students/student_confirm_delete.html', {'student': student})


