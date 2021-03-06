import { Component, OnInit } from '@angular/core';
import {UserService} from '../shared/user.service';
import {ParticipationService} from '../shared/participation.service';
import {User} from '../model/User';
import {Participation} from '../model/Participation';
import {CourseService} from '../shared/course.service';
import {Course} from '../model/Course';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent implements OnInit {
  users:User[]=[];
  user:User=new User();
  participations:Participation[]=[];
  courses:Course[]=[];
  course:Course=new Course();
  availableSeats:number=0;
  constructor(private userService:UserService,private participationService:ParticipationService
  ,private coursesService:CourseService) { }

  ngOnInit(): void {
    this.userService.getUsersJson().subscribe(res=>
    {
      this.users=res;
      this.participationService.getParticipations().subscribe(res=>this.participations=res);
      this.userService.getUserByIdJson(+localStorage.getItem('id')).subscribe(res=>this.user=res)
      this.coursesService.getCoursesJson().subscribe(res=>
      {this.courses=res
        for(let i in this.courses)
        {
          this.availableSeats=this.availableSeats+(this.courses[i].seats - this.courses[i].mumbParticipants);
        }
      }
        );

    });
  }

  deleteUser(u:User)
  {
    this.userService.deleteUser(u).subscribe(next=>this.userService.getUsersJson()
      .subscribe(res=>
      {
        this.users=res;
        for(let i in this.participations)
        {
          if(this.participations[i].idUser==u.id)
          {
            this.coursesService.getCoursesByIdJson(this.participations[i].idCourse).subscribe(res=>{
              res.mumbParticipants--;
              this.course=res;
              this.coursesService.updateCourse(this.course.id,this.course).subscribe();
            })
            this.participationService.deleteParticipation(this.participations[i])
              .subscribe(next=>this.participationService.getParticipations()
                .subscribe(res=>{
                  this.participations=res;
                  this.availableSeats++;
                }));
          }
        }

      }));

  }

}
